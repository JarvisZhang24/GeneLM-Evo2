<div align="center">

# 🧬 GeneLM-Evo2

**Genomic Intelligence Powered by Evo2**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Modal](https://img.shields.io/badge/Modal-Serverless-00D4AA?style=for-the-badge)](https://modal.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

*A full-stack genomic variant analysis platform leveraging the Evo2 DNA language model for zero-shot pathogenicity prediction*

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#️-architecture) • [API](#-api-reference)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔬 Evo2-Powered Analysis
- **7B parameter** DNA language model
- Zero-shot variant pathogenicity prediction
- ~**95% AUROC** on BRCA1 benchmark
- Real-time inference on **H100 GPUs**

</td>
<td width="50%">

### 🧭 Interactive Gene Browser
- Browse by chromosome or search by gene
- Interactive sequence viewer with nucleotide highlighting
- Click any base to trigger variant analysis
- Support for **24+ genome assemblies**

</td>
</tr>
<tr>
<td width="50%">

### 🏥 ClinVar Integration
- Fetch clinically curated variants
- Compare Evo2 predictions vs clinical labels
- One-click analysis for SNVs
- Confidence scoring with delta-likelihood

</td>
<td width="50%">

### ⚡ Modern Tech Stack
- Next.js 15 with Turbopack
- React 19 + TailwindCSS 4
- Modal serverless infrastructure
- UCSC & NCBI API integration

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 15 | React framework with App Router |
| [React](https://react.dev/) | 19 | UI library |
| [TailwindCSS](https://tailwindcss.com/) | 4 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Component library |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Animations |
| [TypeScript](https://www.typescriptlang.org/) | 5.8 | Type safety |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Python](https://python.org/) | 3.12 | Runtime |
| [Modal](https://modal.com/) | Latest | Serverless GPU infrastructure |
| [Evo2](https://github.com/ArcInstitute/evo2) | 7B | DNA language model |
| [PyTorch](https://pytorch.org/) | 2.8 | Deep learning framework |
| [Flash Attention](https://github.com/Dao-AILab/flash-attention) | 2.8.3 | Efficient attention |
| [CUDA](https://developer.nvidia.com/cuda-toolkit) | 12.6 | GPU acceleration |

### External APIs

- **UCSC Genome Browser API** — Reference sequence data
- **NCBI ClinVar API** — Clinical variant annotations
- **NCBI Gene API** — Gene information and coordinates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.12+
- **Modal** account ([sign up](https://modal.com/))
- **NVIDIA GPU** with CUDA support (for local development, or use Modal's H100s)

### Frontend Setup

```bash
# Navigate to frontend directory
cd genelm-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your environment variables
# NEXT_PUBLIC_ANALYZE_SINGLE_VARIANT_BASE_URL=<your-modal-endpoint>

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd genelm-backend

# Install Modal CLI
pip install modal

# Authenticate with Modal
modal setup

# Deploy the application
modal deploy main.py

# Or run locally for development
modal serve main.py
```

After deployment, Modal will provide an endpoint URL for the `analyze_single_variant` API.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Gene Browser│  │  Sequence   │  │   Variant Analysis      │  │
│  │  Component  │  │   Viewer    │  │      Dashboard          │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
└─────────┼────────────────┼──────────────────────┼────────────────┘
          │                │                      │
          ▼                ▼                      ▼
   ┌──────────────┐ ┌──────────────┐    ┌────────────────┐
   │  NCBI Gene   │ │ UCSC Genome  │    │  Modal Backend │
   │     API      │ │     API      │    │    (H100)      │
   └──────────────┘ └──────────────┘    └───────┬────────┘
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │    Evo2      │
                                        │  (7B Model)  │
                                        └──────────────┘
```

### Data Flow

1. **Gene Selection** → User browses/searches genes via NCBI Gene API
2. **Sequence Loading** → Genomic sequence fetched from UCSC API
3. **Variant Selection** → User clicks nucleotide or selects ClinVar variant
4. **Evo2 Analysis** → Request sent to Modal backend with H100 GPU
5. **Prediction** → Model scores reference vs variant sequences
6. **Results** → Delta-likelihood score + pathogenicity prediction returned

---

## 📡 API Reference

### Backend Endpoint

#### `POST /analyze_single_variant`

Analyze a single nucleotide variant using Evo2.

**Request Body:**
```json
{
  "variant_pos": 43119628,
  "alt_allele": "G",
  "genome": "hg38",
  "chromosome": "chr17"
}
```

**Response:**
```json
{
  "position": 43119628,
  "reference": "A",
  "variant": "G",
  "delta_score": -0.00234,
  "prediction": "Likely pathogenic",
  "confidence": 0.87
}
```

| Field | Type | Description |
|-------|------|-------------|
| `position` | int | Genomic position |
| `reference` | str | Reference allele |
| `variant` | str | Alternative allele |
| `delta_score` | float | Log-likelihood difference (ref - var) |
| `prediction` | str | "Likely pathogenic" or "Likely benign" |
| `confidence` | float | Confidence score (0-1) |

---

## 📊 Performance

### BRCA1 Benchmark

| Metric | Value |
|--------|-------|
| **AUROC** | ~95% |
| **Model** | Evo2 7B |
| **Context Window** | 8,192 bp |
| **Variants Tested** | 500 SNVs |
| **Classification** | LOF vs FUNC/INT |

The model uses a threshold-based classification derived from Youden's J statistic optimization on the BRCA1 saturation mutagenesis dataset.

### Inference Performance

| Configuration | Latency |
|---------------|---------|
| Modal H100 (cold start) | ~30s |
| Modal H100 (warm) | ~2-5s |
| Batch scoring (100 variants) | ~60s |

---

## 📁 Project Structure

```
GeneLM-Evo2/
├── genelm-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   │   ├── gene-sequence.tsx
│   │   │   ├── known-variants.tsx
│   │   │   └── ui/           # shadcn/ui components
│   │   └── utils/            # API utilities
│   │       ├── variants-api.ts
│   │       ├── genome-api.ts
│   │       └── genes-api.ts
│   ├── package.json
│   └── tailwind.config.ts
│
├── genelm-backend/           # Modal serverless backend
│   ├── main.py               # Evo2 model & API endpoints
│   └── requirements.txt
│
└── README.md
```

---

## 🔮 Roadmap

- [ ] Batch variant analysis
- [ ] VCF file upload support
- [ ] Additional gene benchmarks (TP53, BRCA2)
- [ ] Variant effect visualization
- [ ] Export results to PDF/CSV
- [ ] Multi-model comparison (ESM, Nucleotide Transformer)

---

## 🙏 Acknowledgments

- **[Arc Institute](https://arcinstitute.org/)** — Evo2 DNA language model
- **[Modal](https://modal.com/)** — Serverless GPU infrastructure
- **[UCSC Genome Browser](https://genome.ucsc.edu/)** — Reference genome data
- **[NCBI ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/)** — Clinical variant database
- **[shadcn/ui](https://ui.shadcn.com/)** — Beautiful UI components

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 🧬 by [Jarvis Zhang](https://github.com/JarvisZhang24)**

</div>
