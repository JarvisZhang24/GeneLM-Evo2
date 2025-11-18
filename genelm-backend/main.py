import modal
from modal import mount

from pydantic import BaseModel

class VariantRequest(BaseModel):
    variant_pos: int
    alt_allele: str
    genome: str
    chromosome: str


# ---------- Build image ----------
evo2_image = (
    modal.Image.from_registry(
        "nvidia/cuda:12.6.0-devel-ubuntu22.04",
        add_python="3.12",
        #force_build=True,
    )
    .apt_install([
        "build-essential",
        "cmake",
        "ninja-build",
        "git",
        "gcc",
        "g++",
        "libcudnn9-cuda-12",
        "libcudnn9-dev-cuda-12",
    ])
    .env({
        "CUDA_HOME": "/usr/local/cuda",
        "LD_LIBRARY_PATH": "/usr/local/cuda/lib64:/usr/local/lib:${LD_LIBRARY_PATH}",
        "CC": "/usr/bin/gcc",
        "CXX": "/usr/bin/g++",
    })

    # 安装 fast pip 包管理器
    .run_commands("pip install uv")

    .run_commands("uv pip install --system --upgrade pip wheel setuptools packaging")
    .run_commands("uv pip install --system --index-url https://download.pytorch.org/whl/cu128 torch==2.8.0")
    .run_commands("uv pip install --system 'transformer_engine[pytorch]==2.6.0.post1' --no-build-isolation")
    .run_commands("uv pip install --system 'flash-attn==2.8.3' --no-build-isolation")
    .run_commands("uv pip install --system 'vtx>=0.0.8'")
    .run_commands("git clone --recurse-submodules https://github.com/ArcInstitute/evo2.git")
    .run_commands("cd evo2 && uv pip install --system .")
    .run_commands("uv pip install --system fastapi")
    .pip_install_from_requirements("requirements.txt")
)

volume = modal.Volume.from_name("hf_cache" , create_if_missing=True)
mount_path = "/root/.cache/huggingface"


app = modal.App("variant-analysis-evo2", image=evo2_image)

@app.function(
    gpu = "H100" , 
    volumes= {mount_path: volume}
)
def run_brca1_analysis():
    import base64
    from io import BytesIO
    from Bio import SeqIO
    import gzip
    import matplotlib.pyplot as plt
    import numpy as np
    import pandas as pd
    import os
    import seaborn as sns
    from sklearn.metrics import roc_auc_score , roc_curve

    from evo2 import Evo2

    WINDOW_SIZE = 8192
    print("Loading Evo2...")
    model = Evo2('evo2_7b')
    print("Evo2 loaded.")

    # load brca1 sequence
    brca1_df = pd.read_excel(
        '/evo2/notebooks/brca1/41586_2018_461_MOESM3_ESM.xlsx',
        header=2,
    )
    brca1_df = brca1_df[[
        'chromosome', 'position (hg19)', 'reference', 'alt', 'function.score.mean', 'func.class',
    ]]

    # Rename columns
    brca1_df.rename(columns={
        'chromosome': 'chrom',
        'position (hg19)': 'pos',
        'reference': 'ref',
        'alt': 'alt',
        'function.score.mean': 'score',
        'func.class': 'class',
    }, inplace=True)

    # Convert to two-class system
    brca1_df['class'] = brca1_df['class'].replace(['FUNC', 'INT'], 'FUNC/INT')

    # Read the reference genome sequence of chromosome 17
    with gzip.open('/evo2/notebooks/brca1/GRCh37.p13_chr17.fna.gz', "rt") as handle:
        for record in SeqIO.parse(handle, "fasta"):
            seq_chr17 = str(record.seq)
            break

    # Build mappings of unique reference sequences
    ref_seqs = []
    ref_seq_to_index = {}

    # Parse sequences and store indexes
    ref_seq_indexes = []
    var_seqs = []

    brca1_subset = brca1_df.iloc[:500].copy()

    for _, row in brca1_subset.iterrows():
        """
        Parse reference and variant sequences from the reference genome sequence.
        """
        p = row['pos'] - 1 # Convert to 0-indexed position
        full_seq = seq_chr17

        ref_seq_start = max(0, p - WINDOW_SIZE//2)
        ref_seq_end = min(len(full_seq), p + WINDOW_SIZE//2)
        ref_seq = seq_chr17[ref_seq_start:ref_seq_end]
        # Create variant sequence
        snv_pos_in_ref = min(WINDOW_SIZE//2, p)
        var_seq = ref_seq[:snv_pos_in_ref] + row['alt'] + ref_seq[snv_pos_in_ref+1:]

        # Get or create index for reference sequence
        if ref_seq not in ref_seq_to_index:
            ref_seq_to_index[ref_seq] = len(ref_seqs)
            ref_seqs.append(ref_seq)
        
        ref_seq_indexes.append(ref_seq_to_index[ref_seq])
        var_seqs.append(var_seq)

    ref_seq_indexes = np.array(ref_seq_indexes)

    print(f'Scoring likelihoods of {len(ref_seqs)} reference sequences with Evo 2...')
    ref_scores = model.score_sequences(ref_seqs)

    print(f'Scoring likelihoods of {len(var_seqs)} variant sequences with Evo 2...')
    var_scores = model.score_sequences(var_seqs)

    # Subtract score of corresponding reference sequences from scores of variant sequences
    delta_scores = np.array(var_scores) - np.array(ref_scores)[ref_seq_indexes]

    # Add delta scores to dataframe
    brca1_subset[f'evo2_delta_score'] = delta_scores

    # Calculate AUROC of zero-shot predictions
    y_true = (brca1_subset['class'] == 'LOF')
    auroc = roc_auc_score(y_true, -brca1_subset['evo2_delta_score'])
    print(f'AUROC of zero-shot predictions: {auroc}')


    # --- Calculate threshold ---
    y_true = (brca1_subset['class'] == 'LOF')

    fpr, tpr, thresholds = roc_curve(y_true, -brca1_subset['evo2_delta_score'])

    # Find threshold that maximizes Youden's J statistic
    optimal_idx = np.argmax(tpr - fpr)
    optimal_threshold = -thresholds[optimal_idx]

    # Calculate confidence intervals for AUROC
    lof_score = brca1_subset.loc[brca1_subset['class'] == 'LOF', 'evo2_delta_score']

    func_int_score = brca1_subset.loc[brca1_subset['class'] == 'FUNC/INT', 'evo2_delta_score']

    lof_stf = lof_score.std()
    func_int_stf = func_int_score.std()


    
    
    
    confidence_params = {
        'optimal_threshold': optimal_threshold,
        'optimal_idx': optimal_idx,
        'lof_stf': lof_stf,
        'func_int_stf': func_int_stf,
    }
    
    print(f'Confidence parameters: {confidence_params}')
    

    # --- Plot results ---
    # plot results
    plt.figure(figsize=(4, 2))

    # Plot stripplot of distributions
    p = sns.stripplot(
        data=brca1_subset,
        x='evo2_delta_score',
        y='class',
        hue='class',
        order=['FUNC/INT', 'LOF'],
        palette=['#777777', 'C3'],
        size=2,
        jitter=0.3,
    )

    # Mark medians from each distribution
    sns.boxplot(showmeans=True,
                meanline=True,
                meanprops={'visible': False},
                medianprops={'color': 'k', 'ls': '-', 'lw': 2},
                whiskerprops={'visible': False},
                zorder=10,
                x="evo2_delta_score",
                y="class",
                data=brca1_subset,
                showfliers=False,
                showbox=False,
                showcaps=False,
                ax=p)
    plt.xlabel('Delta likelihood score, Evo 2')
    plt.ylabel('BRCA1 SNV class')
    plt.tight_layout()
    plt.show()

    # Save plot to buffer
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    
    return {'variants': brca1_subset.to_dict(orient='records'), 
            'plot_base64': plot_base64,
            'auroc': auroc}
    

       

@app.function()
def brca1_example():
    import base64
    from io import BytesIO
    import matplotlib.pyplot as plt
    import matplotlib.image as mpimg
    
    print("Testing BRCA1 example with Evo2...")

    # run inference

    results = run_brca1_analysis.remote()

    # get results
    if 'plot_base64' in results:
        plot_data = base64.b64decode(results['plot_base64'])
        with open('brca1_variant_analysis.png', 'wb') as f:
            f.write(plot_data)
        
        img = mpimg.imread(BytesIO(plot_data))
        plt.figure(figsize=(8, 4))
        plt.imshow(img)
        plt.axis('off')
        plt.show()
    
    print("BRCA1 example completed.")


def analyze_variant(relative_pos: int, ref_allele: str, alt_allele: str, window_seq: str , model):
    # Get variant sequence
    var_seq = window_seq[:relative_pos] + alt_allele + window_seq[relative_pos+1:]
    print(f"Variant sequence: {var_seq}")

    # Score variant sequence
    var_score = model.score_sequences([var_seq])[0]
    print(f"Variant score: {var_score}")

    # Score reference sequence
    ref_score = model.score_sequences([window_seq])[0]
    print(f"Reference score: {ref_score}")
    
    # Calculate delta score
    delta_score = var_score - ref_score
    print(f"Delta score: {delta_score}")

    # Calculate threshold
    # Confidence parameters: {'optimal_threshold': np.float32(-0.0009178519), 'optimal_idx': np.int64(92), 'lof_stf': np.float32(0.0015140239), 'func_int_stf': np.float32(0.0009016589)}
    threshold = -0.0009178519
    lof_std = 0.0015140239
    func_int_std = 0.0009016589

    # Calculate confidence interval
    if delta_score < threshold:
        prediction = "Likely pathogenic"
        confidence = min(1.0 , abs(delta_score - threshold) / lof_std)
    else:
        prediction = "Likely benign"
        confidence = min(1.0 , abs(delta_score - threshold) / func_int_std)

    return {
        'reference': ref_allele,
        'variant': alt_allele,
        'delta_score': float(delta_score),
        'prediction': prediction,
        'confidence': float(confidence)
    }
    


def get_genome_sequence(position: int, genome: str, chromosome: str , window_size: int = 8192):
    import requests


    half_window_size = window_size // 2

    start_pos = max(0, position - 1- half_window_size)
    end_pos = position - 1 + half_window_size + 1

    print(f"Fetching genome sequence for chromosome {chromosome}, position {position}, window size {window_size}")
    print(f"Coordinates: {chromosome}:{start_pos}-{end_pos}")

    api_url = f"https://api.genome.ucsc.edu/getData/sequence?genome={genome};chrom={chromosome};start={start_pos};end={end_pos}"
    response = requests.get(api_url)

    if response.status_code != 200:
        raise Exception(f"Failed to fetch genome sequence from UCSC API: {response.text}")

    # parse response
    genome_data = response.json()
    if 'dna' not in genome_data:
        error = genome_data.get('error', 'Unknown error')
        raise Exception(f"Failed to fetch genome sequence from UCSC API: {error}")
    
    sequence = genome_data.get("dna", "").upper()

    # check if sequence length matches expected length
    expected_length = end_pos - start_pos 
    if len(sequence) != expected_length:
        print(f"Warning: Sequence length {len(sequence)} does not match expected length {expected_length}")
        print(f"Sequence: {sequence}")

    print(f"Loaded genome sequence for chromosome {chromosome}, position {position}, window size {window_size}")
    print(f"Loaded reference genome sequence window (length: {len(sequence)} bases)")

    return sequence , start_pos

    
    
    

@app.cls(
    gpu = 'H100', 
    volumes = {mount_path: volume}, 
    max_containers=3,
    retries=3,
    scaledown_window=30
)
class Ev2Model:
    
    @modal.enter()
    def load_ev2_model(self):
        from evo2 import Evo2
        print("Loading Evo2...")
        self.model = Evo2('evo2_7b')
        print("Evo2 loaded.")
        
    # @modal.method()
    @modal.fastapi_endpoint(method="POST")
    def analyze_single_variant(self, request: VariantRequest):
        variant_pos = request.variant_pos
        alt_allele = request.alt_allele
        genome = request.genome
        chromosome = request.chromosome
        
        
        print("Analyzing single variant...")
        print(f"Variant pos: {variant_pos}")
        print(f"Alt allele: {alt_allele}")
        print(f"Genome: {genome}")
        print(f"Chromosome: {chromosome}")

        WINDOW_SIZE = 8192

        # Get reference sequence
        window_seq , window_seq_start = get_genome_sequence(variant_pos, genome, chromosome, WINDOW_SIZE)
        
        # Fetch first 100 bases of reference sequence
        print(f"Fetched first 100 bases of reference sequence: {window_seq[:100]}")

        # Get relative position of variant in window
        relative_pos = variant_pos - window_seq_start -1
        print(f"Relative position: {relative_pos}")

        if relative_pos < 0 or relative_pos >= WINDOW_SIZE:
            raise ValueError(f"Variant position {variant_pos} is out of bounds for window sequence of length {WINDOW_SIZE}")
        
        # Get Reference allele
        ref_allele = window_seq[relative_pos]
        print(f"Reference allele: {ref_allele}")

        # Analyze variant

        result = analyze_variant(relative_pos, ref_allele, alt_allele, window_seq, self.model)

        result['position'] = variant_pos
        
        return result

        
@app.local_entrypoint()
def main():
    # brca1_example.remote()
    ev2_model = Ev2Model()
    result = ev2_model.analyze_single_variant.remote(VariantRequest(variant_pos=43119628, alt_allele='G', genome='hg38', chromosome='chr17'))
    print(result)