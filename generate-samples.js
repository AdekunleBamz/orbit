const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const samplesDir = path.join(__dirname, "samples");
if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir);

function writePaper(filename, paper) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 72 });
    const stream = fs.createWriteStream(path.join(samplesDir, filename));
    doc.pipe(stream);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text(paper.title, { align: "center" });
    doc.moveDown(0.5);

    // Authors
    doc.fontSize(10).font("Helvetica").text(paper.authors, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(9).font("Helvetica-Oblique").text(paper.affiliation, { align: "center" });
    doc.moveDown(1);

    // Abstract
    doc.fontSize(11).font("Helvetica-Bold").text("Abstract");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text(paper.abstract, { align: "justify", lineGap: 2 });
    doc.moveDown(1);

    // Sections
    for (const section of paper.sections) {
      doc.fontSize(12).font("Helvetica-Bold").text(section.heading);
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(section.body, { align: "justify", lineGap: 2 });
      doc.moveDown(0.8);
    }

    // References
    doc.fontSize(12).font("Helvetica-Bold").text("References");
    doc.moveDown(0.3);
    for (const ref of paper.references) {
      doc.fontSize(9).font("Helvetica").text(ref, { lineGap: 1 });
      doc.moveDown(0.2);
    }

    doc.end();
    stream.on("finish", resolve);
  });
}

// ─── Paper 1 ───────────────────────────────────────────────────────────
const paper1 = {
  title: "Scaling Transformer Architectures for Scientific Document Understanding",
  authors: "Raj Patel, Amara Osei, Liu Wei, Sofia Marchetti",
  affiliation: "Institute for Computational Research, ETH Zurich — January 2026",
  abstract:
    "Large language models based on the Transformer architecture have demonstrated remarkable capabilities in natural language understanding. However, their application to scientific documents — which contain complex equations, domain-specific terminology, figures, and structured tables — remains challenging. In this paper, we present SciTransformer, a modified Transformer architecture optimized for scientific document comprehension. Our model introduces three key innovations: (1) a hierarchical attention mechanism that processes document sections at multiple granularities, (2) an equation-aware tokenizer that preserves mathematical structure, and (3) a figure-caption alignment module that grounds visual elements in textual context. Evaluated on a new benchmark of 12,000 annotated scientific papers across physics, biology, and computer science, SciTransformer achieves a 23% improvement in concept extraction accuracy over GPT-4 and a 31% improvement in cross-reference resolution. We also demonstrate that our hierarchical attention reduces computational cost by 40% compared to standard full-attention Transformers on long documents (>15,000 tokens). Our findings suggest that domain-specific architectural modifications, rather than simply scaling model parameters, are critical for advancing scientific AI applications.",
  sections: [
    {
      heading: "1. Introduction",
      body: "The rapid growth of scientific literature — over 3 million papers published annually — has created an urgent need for automated tools that can help researchers navigate, understand, and synthesize findings across disciplines. While general-purpose large language models (LLMs) such as GPT-4 and Gemini have shown strong performance on a variety of NLP benchmarks, their effectiveness degrades significantly when applied to scientific documents. The reasons are threefold: scientific papers contain dense mathematical notation that standard tokenizers fail to parse correctly; they rely heavily on figures, charts, and tables to convey key findings; and they use highly specialized vocabulary that varies across disciplines.\n\nPrevious efforts to address these challenges include SciBERT (Beltagy et al., 2019), which pre-trained BERT on scientific corpora, and Galactica (Taylor et al., 2022), which trained a large model specifically on scientific text. However, these approaches focused primarily on textual content and did not adequately handle the multimodal nature of scientific documents. Our work bridges this gap by introducing architectural modifications to the Transformer that are specifically designed for the unique structure of scientific papers.",
    },
    {
      heading: "2. Methodology",
      body: "SciTransformer builds on the standard Transformer encoder-decoder architecture with three key modifications.\n\nHierarchical Attention: Instead of applying self-attention uniformly across all tokens, we introduce a two-level attention mechanism. At the local level, attention operates within individual sections (abstract, methods, results, etc.). At the global level, a cross-section attention layer aggregates information across the entire document. This design is motivated by the observation that scientific papers have a well-defined section structure, and relevant information for understanding a concept is often concentrated within specific sections. The hierarchical design reduces the quadratic complexity of full attention from O(n²) to O(n·s + s²), where s is the number of sections.\n\nEquation-Aware Tokenizer: Standard BPE and WordPiece tokenizers fragment mathematical equations into meaningless sub-tokens. Our equation-aware tokenizer first identifies LaTeX and Unicode math expressions using a lightweight parser, then represents each equation as a structured tree with operator, operand, and relation nodes. This preserves semantic relationships such as E = mc² being understood as an equivalence between energy and mass-times-velocity-squared.\n\nFigure-Caption Alignment: We add a contrastive learning module that aligns figure embeddings (obtained via a frozen CLIP encoder) with their captions. During inference, when the model encounters a figure reference in text (e.g., 'as shown in Figure 3'), it can retrieve and reason over the corresponding visual information.",
    },
    {
      heading: "3. Experimental Setup",
      body: "We evaluate SciTransformer on three tasks: (1) concept extraction — identifying key concepts, methods, and findings from papers; (2) cross-reference resolution — linking in-text references to the correct figures, tables, and equations; and (3) paper summarization — generating structured summaries that preserve technical accuracy.\n\nOur benchmark, SciBench-12K, consists of 12,000 papers sampled from arXiv across three domains: high-energy physics (4,000), molecular biology (4,000), and machine learning (4,000). Each paper is annotated by domain experts with concept labels, cross-reference links, and gold-standard summaries.\n\nBaselines include GPT-4 (with full paper as context), SciBERT fine-tuned on our dataset, Galactica-30B, and a standard Transformer trained from scratch on SciBench-12K. All models are evaluated using precision, recall, and F1 for extraction tasks, and ROUGE-L and BERTScore for summarization.",
    },
    {
      heading: "4. Results and Discussion",
      body: "SciTransformer achieves state-of-the-art results across all three tasks. For concept extraction, it achieves an F1 score of 0.847, compared to 0.689 for GPT-4 and 0.612 for SciBERT. The improvement is most pronounced for extracting mathematical concepts and methodology descriptions, where the equation-aware tokenizer provides the largest benefit.\n\nFor cross-reference resolution, SciTransformer achieves 89.3% accuracy compared to 68.1% for GPT-4. This task is where the figure-caption alignment module contributes most significantly — without it, accuracy drops to 74.2%.\n\nFor paper summarization, SciTransformer achieves a ROUGE-L score of 0.523 and a BERTScore of 0.891, compared to 0.487 and 0.862 for GPT-4 respectively. Human evaluators rated SciTransformer summaries as more technically accurate in 72% of comparisons.\n\nComputational efficiency is also notable: on documents exceeding 15,000 tokens, SciTransformer processes papers 40% faster than a standard Transformer with full attention, thanks to the hierarchical attention mechanism. Memory usage is reduced by approximately 35%.\n\nA key limitation of our approach is that the figure-caption alignment module relies on a frozen CLIP encoder, which may not generalize well to highly specialized scientific figures such as crystallography diagrams or genetic maps. Future work should explore domain-specific visual encoders.",
    },
    {
      heading: "5. Conclusion",
      body: "We have presented SciTransformer, a Transformer variant specifically designed for scientific document understanding. Through hierarchical attention, equation-aware tokenization, and figure-caption alignment, our model achieves significant improvements over general-purpose LLMs on scientific NLP tasks. Our results demonstrate that thoughtful architectural modifications, rather than brute-force parameter scaling, can yield substantial gains in domain-specific applications. We release our model weights, code, and the SciBench-12K benchmark to facilitate future research in this direction.",
    },
  ],
  references: [
    "[1] Vaswani, A. et al. (2017). Attention Is All You Need. NeurIPS.",
    "[2] Beltagy, I. et al. (2019). SciBERT: A Pretrained Language Model for Scientific Text. EMNLP.",
    "[3] Taylor, R. et al. (2022). Galactica: A Large Language Model for Science. arXiv:2211.09085.",
    "[4] Radford, A. et al. (2021). Learning Transferable Visual Models From Natural Language Supervision. ICML.",
    "[5] Devlin, J. et al. (2019). BERT: Pre-training of Deep Bidirectional Transformers. NAACL.",
    "[6] Sennrich, R. et al. (2016). Neural Machine Translation of Rare Words with Subword Units. ACL.",
    "[7] Lewis, M. et al. (2020). BART: Denoising Sequence-to-Sequence Pre-training. ACL.",
    "[8] Zhang, T. et al. (2020). BERTScore: Evaluating Text Generation with BERT. ICLR.",
  ],
};

// ─── Paper 2 ───────────────────────────────────────────────────────────
const paper2 = {
  title: "Cross-Modal Knowledge Transfer in Multimodal AI Systems",
  authors: "Chen Xiaoyu, David Rothberg, Priya Nair, Jonas Lindqvist",
  affiliation: "Stanford AI Lab & Google DeepMind — December 2025",
  abstract:
    "Multimodal AI systems that integrate information across text, images, audio, and structured data have emerged as a frontier in artificial intelligence research. A fundamental challenge in building such systems is enabling effective knowledge transfer between modalities — allowing insights learned from one data type to enhance understanding of another. In this paper, we introduce CrossFlow, a framework for cross-modal knowledge transfer that leverages shared latent representations to bridge modality gaps. CrossFlow operates through three stages: (1) modality-specific encoding using specialized encoders, (2) projection into a shared semantic space via contrastive alignment, and (3) cross-modal attention that enables each modality to attend to relevant features in other modalities. We evaluate CrossFlow on four multimodal benchmarks spanning visual question answering, scientific figure interpretation, medical image-report matching, and audio-visual event detection. CrossFlow achieves state-of-the-art results on three of four benchmarks, with an average improvement of 12.4% over prior multimodal fusion methods. Notably, our analysis reveals that cross-modal transfer is most effective when modalities share underlying semantic structure — for instance, scientific figures and their captions, or medical images and diagnostic reports. We discuss implications for the design of next-generation multimodal AI systems.",
  sections: [
    {
      heading: "1. Introduction",
      body: "The past five years have witnessed extraordinary progress in AI systems that process individual modalities — text (GPT-4, Gemini), images (DALL-E 3, Stable Diffusion), and audio (Whisper, AudioPaLM). However, human cognition is inherently multimodal: we integrate visual, auditory, and linguistic information seamlessly and continuously. Building AI systems that achieve similar integration remains one of the grand challenges of the field.\n\nExisting multimodal models typically employ one of two strategies: early fusion, where raw inputs from different modalities are concatenated and processed jointly, or late fusion, where modality-specific models produce separate representations that are combined at a decision layer. Both approaches have significant limitations. Early fusion struggles with the heterogeneity of input formats and often requires enormous computational resources. Late fusion, while more practical, misses fine-grained cross-modal interactions that are critical for tasks requiring deep understanding.\n\nOur work introduces a third approach — cross-modal knowledge transfer — where learned representations in one modality are used to enhance processing in another. This is analogous to how a radiologist's textual knowledge of pathology improves their interpretation of medical images, or how understanding a scientific paper's methodology helps interpret its results figures.",
    },
    {
      heading: "2. The CrossFlow Framework",
      body: "CrossFlow consists of three components designed to enable effective cross-modal knowledge transfer.\n\nModality-Specific Encoders: Each input modality is processed by a specialized encoder: a Transformer for text, a Vision Transformer (ViT) for images, and a Conformer for audio. These encoders are pre-trained on large unimodal datasets and produce modality-specific representations. Importantly, we keep the early layers of each encoder frozen during multimodal training, preserving learned low-level features while allowing higher-level representations to adapt.\n\nShared Semantic Space: Modality-specific representations are projected into a shared D-dimensional semantic space using learned linear projections followed by layer normalization. We train these projections using a multi-view contrastive loss that encourages semantically related inputs from different modalities (e.g., an image and its caption) to have similar representations, while pushing unrelated pairs apart.\n\nCross-Modal Attention: The core innovation of CrossFlow is a bidirectional cross-modal attention mechanism. For each pair of modalities, we compute attention weights that allow tokens in one modality to attend to relevant tokens in the other. For example, when processing a scientific figure, the model can attend to relevant words in the accompanying paper text. This attention is computed in the shared semantic space, ensuring that the model can identify meaningful cross-modal correspondences.\n\nThe overall objective function combines the contrastive alignment loss with task-specific losses (e.g., classification, generation) in a multi-task learning framework.",
    },
    {
      heading: "3. Experiments",
      body: "We evaluate CrossFlow on four benchmarks chosen to represent diverse multimodal challenges:\n\n(1) VQA v2.0 — Visual question answering requiring joint understanding of images and natural language questions. CrossFlow achieves 82.7% accuracy compared to the previous best of 80.1%.\n\n(2) SciGraphQA — A new benchmark we introduce for answering questions about scientific figures. The dataset contains 8,500 figure-question-answer triples from published papers. CrossFlow achieves 71.3% accuracy vs. 58.9% for GPT-4V.\n\n(3) MIMIC-CXR — Medical image-report matching, where the system must align chest X-rays with the correct radiology reports. CrossFlow achieves an AUC of 0.934 compared to 0.891 for specialized medical AI models.\n\n(4) AudioSet-Events — Audio-visual event detection in video clips. CrossFlow achieves a mAP of 0.487 compared to 0.451 for the previous state-of-the-art.\n\nAblation studies reveal that cross-modal attention contributes the most to performance gains, accounting for 60-70% of the improvement over late fusion baselines. The shared semantic space projection accounts for 20-25%, and the remaining gains come from the multi-task training objective.",
    },
    {
      heading: "4. Analysis: When Does Cross-Modal Transfer Work?",
      body: "A key contribution of this paper is our systematic analysis of when cross-modal knowledge transfer is most effective. We identify three factors that predict transfer success:\n\nSemantic Overlap: Transfer is most effective when modalities share underlying semantic structure. Scientific figures and their captions have high semantic overlap — both describe the same experimental results. In contrast, background music in a video often has low semantic overlap with the visual content, leading to minimal transfer benefits.\n\nGranularity Match: Transfer works best when the information granularity is similar across modalities. Detailed medical images and comprehensive radiology reports operate at similar levels of detail, enabling rich transfer. In contrast, transferring between a photograph and a single-sentence caption is limited by the low information density of the caption.\n\nTraining Data Quality: The quality of paired multimodal training data significantly affects transfer performance. Noisy or weakly-aligned pairs (e.g., images with loosely related alt-text) produce weak transfer signals. Carefully curated datasets with expert-annotated alignments produce much stronger transfer.\n\nThese findings have important implications for the design of multimodal AI systems and suggest that simply scaling data and parameters is insufficient — the quality and structure of cross-modal training data is equally critical.",
    },
    {
      heading: "5. Conclusion",
      body: "We have presented CrossFlow, a framework for cross-modal knowledge transfer in multimodal AI systems. Our results demonstrate that enabling modalities to directly transfer knowledge to each other, rather than simply fusing their representations, leads to significant performance improvements on a range of benchmarks. Our analysis identifies the conditions under which cross-modal transfer is most effective, providing guidance for future research. We release CrossFlow's code, pre-trained models, and the SciGraphQA benchmark at github.com/crossflow-ai.",
    },
  ],
  references: [
    "[1] Radford, A. et al. (2021). Learning Transferable Visual Models From Natural Language Supervision. ICML.",
    "[2] Dosovitskiy, A. et al. (2021). An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale. ICLR.",
    "[3] Gulati, A. et al. (2020). Conformer: Convolution-augmented Transformer for Speech Recognition. Interspeech.",
    "[4] Goyal, Y. et al. (2017). Making the V in VQA Matter. CVPR.",
    "[5] Johnson, A. et al. (2019). MIMIC-CXR: A Large Publicly Available Database of Labeled Chest Radiographs. Scientific Data.",
    "[6] Gemmeke, J. et al. (2017). Audio Set: An Ontology and Human-Labeled Dataset for Audio Events. ICASSP.",
    "[7] Alayrac, J. et al. (2022). Flamingo: a Visual Language Model for Few-Shot Learning. NeurIPS.",
    "[8] Li, J. et al. (2023). BLIP-2: Bootstrapping Language-Image Pre-training with Frozen Image Encoders. ICML.",
  ],
};

// ─── Paper 3 ───────────────────────────────────────────────────────────
const paper3 = {
  title: "Automated Hypothesis Generation from Scientific Literature Using Graph Neural Networks",
  authors: "Elena Vasquez, Michael O'Brien, Takeshi Yamamoto, Fatima Al-Rashid",
  affiliation: "MIT CSAIL & Allen Institute for AI — February 2026",
  abstract:
    "The acceleration of scientific discovery depends not only on the ability to analyze existing research but also on the capacity to generate novel, testable hypotheses that bridge knowledge gaps. In this paper, we present HypoGraph, a system that automatically generates scientific hypotheses by constructing and reasoning over knowledge graphs extracted from scientific literature. HypoGraph operates in three phases: (1) extraction of entities, relationships, and claims from papers using a fine-tuned large language model, (2) construction of a domain-specific knowledge graph with typed nodes (concepts, methods, findings, datasets) and weighted edges (supports, contradicts, extends, requires), and (3) hypothesis generation through graph neural network (GNN) reasoning that identifies underexplored connections and predicts likely but unverified relationships. We evaluate HypoGraph in two domains — drug repurposing and materials science — where generated hypotheses can be partially validated against subsequent publications. In drug repurposing, 34% of HypoGraph's top-50 hypotheses were confirmed by papers published after our training cutoff. In materials science, 28% of predicted material-property relationships were validated. Expert evaluation by domain scientists rated 62% of generated hypotheses as 'scientifically plausible and worth investigating.' Our results suggest that automated hypothesis generation from literature can meaningfully accelerate scientific discovery by surfacing non-obvious connections that human researchers might miss.",
  sections: [
    {
      heading: "1. Introduction",
      body: "Scientific progress has historically relied on the intuition and creativity of individual researchers to formulate new hypotheses. However, as the volume of scientific literature grows exponentially — with over 5 million papers indexed by PubMed alone in 2025 — no single researcher can stay current with all relevant developments, even within a narrow specialty. This creates an opportunity for AI systems that can read, understand, and reason across large bodies of literature to suggest novel research directions.\n\nThe idea of literature-based discovery dates back to Swanson's seminal work in the 1980s, where he identified a potential link between fish oil and Raynaud's syndrome by connecting two previously unrelated bodies of research. Since then, various computational approaches have been proposed, including co-occurrence analysis, latent semantic analysis, and more recently, transformer-based models. However, these approaches typically operate on shallow textual features and fail to capture the rich relational structure of scientific knowledge.\n\nOur approach, HypoGraph, addresses this limitation by explicitly constructing knowledge graphs from scientific literature and using graph neural networks to reason over the resulting structure. By representing scientific knowledge as a graph — where nodes are concepts, methods, and findings, and edges represent relationships like 'supports,' 'contradicts,' or 'extends' — we enable a form of reasoning that can identify gaps, bridge disconnected subgraphs, and predict novel relationships.",
    },
    {
      heading: "2. System Architecture",
      body: "HypoGraph consists of three main modules:\n\nKnowledge Extraction Module: We fine-tune Gemini 2.5 Pro on a dataset of 5,000 manually annotated scientific papers to extract structured knowledge triples of the form (entity₁, relation, entity₂). Entity types include Concept, Method, Finding, Dataset, Metric, and Material. Relation types include supports, contradicts, extends, requires, produces, and measured_by. The extraction module achieves 87.3% precision and 79.1% recall on a held-out test set of 500 papers.\n\nKnowledge Graph Construction: Extracted triples are aggregated into a domain-specific knowledge graph. Duplicate entities are merged using a combination of string matching, embedding similarity, and LLM-based coreference resolution. Edge weights are assigned based on the frequency of the relationship across papers and the impact factor of the source publications. The resulting graphs contain 50,000–200,000 nodes and 500,000–2,000,000 edges depending on the domain.\n\nHypothesis Generation via GNN: We train a heterogeneous graph neural network (HGNN) to predict missing edges in the knowledge graph — that is, relationships that are likely to hold but have not yet been reported in the literature. The HGNN uses a message-passing architecture with 6 layers, attention-based aggregation, and edge-type-specific transformation matrices. For hypothesis generation, we identify node pairs with high predicted edge probability but no existing connection. These predicted connections are then verbalized into natural language hypotheses using a template-based generation system refined by an LLM.",
    },
    {
      heading: "3. Evaluation",
      body: "We evaluate HypoGraph in two scientific domains:\n\nDrug Repurposing: We construct a knowledge graph from 45,000 biomedical papers published before January 2025, covering drug mechanisms, disease pathways, and clinical outcomes. We generate hypotheses about potential drug-disease relationships — specifically, existing drugs that might be effective for diseases they were not originally designed to treat. To validate, we check whether papers published between January 2025 and January 2026 report evidence supporting the predicted relationships. Of HypoGraph's top 50 ranked hypotheses, 17 (34%) were confirmed or partially supported by subsequent publications.\n\nMaterials Science: We build a knowledge graph from 28,000 papers in materials science, focusing on material compositions, synthesis methods, and physical properties. We generate hypotheses about untested material-property relationships. Of the top 50 predictions, 14 (28%) were validated by subsequent experimental results reported in the literature.\n\nExpert Evaluation: We recruited 12 domain experts (6 in biomedicine, 6 in materials science) to evaluate 100 randomly sampled hypotheses from each domain. Experts rated each hypothesis on a 5-point scale for scientific plausibility, novelty, and testability. Overall, 62% of hypotheses were rated 4 or 5 ('plausible and worth investigating' or 'highly promising'), 24% were rated 3 ('somewhat plausible'), and 14% were rated 1 or 2 ('implausible' or 'trivial').",
    },
    {
      heading: "4. Analysis and Limitations",
      body: "Several patterns emerge from our analysis of successful vs. unsuccessful hypothesis generation:\n\nBridging Disconnected Subgraphs: The most successful hypotheses tend to bridge two research communities that study related phenomena using different terminology or methods. For example, HypoGraph successfully predicted that a kinase inhibitor studied in oncology could be effective for a neuroinflammatory condition, by identifying shared molecular pathway nodes in the knowledge graph.\n\nTemporal Patterns: Hypotheses about rapidly evolving fields (e.g., mRNA therapeutics) have higher validation rates than those about mature fields, likely because there are more knowledge gaps to be filled.\n\nLimitations: Our system has several notable limitations. First, the quality of generated hypotheses is bounded by the quality of the knowledge extraction module — errors in extraction propagate to the graph and can produce implausible hypotheses. Second, our validation methodology (checking against subsequent publications) is inherently biased toward mainstream research directions and may not capture truly novel hypotheses. Third, the system currently does not incorporate quantitative data (e.g., experimental measurements) into the knowledge graph, which limits its ability to reason about effect sizes and statistical significance.\n\nFuture work should address these limitations by integrating quantitative data, incorporating uncertainty estimation into the GNN predictions, and developing methods to assess the true novelty (rather than just plausibility) of generated hypotheses.",
    },
    {
      heading: "5. Conclusion",
      body: "We have presented HypoGraph, a system for automated hypothesis generation from scientific literature. By combining LLM-based knowledge extraction with graph neural network reasoning, HypoGraph can identify non-obvious connections across research areas and generate testable hypotheses with meaningful validation rates. Our results in drug repurposing and materials science demonstrate that AI-assisted hypothesis generation is a viable approach to accelerating scientific discovery. We believe that tools like HypoGraph, when used alongside human expertise, can help researchers identify promising research directions more efficiently and potentially lead to discoveries that might otherwise take years to emerge.",
    },
  ],
  references: [
    "[1] Swanson, D. (1986). Undiscovered Public Knowledge. Library Quarterly.",
    "[2] Schlichtkrull, M. et al. (2018). Modeling Relational Data with Graph Convolutional Networks. ESWC.",
    "[3] Wang, Z. et al. (2014). Knowledge Graph Embedding by Translating on Hyperplanes. AAAI.",
    "[4] Bordes, A. et al. (2013). Translating Embeddings for Modeling Multi-relational Data. NeurIPS.",
    "[5] Veličković, P. et al. (2018). Graph Attention Networks. ICLR.",
    "[6] Zeng, X. et al. (2020). Repurpose Open Data to Discover Therapeutics for COVID-19 Using Deep Learning. JPIPR.",
    "[7] Tshitoyan, V. et al. (2019). Unsupervised Word Embeddings Capture Latent Knowledge from Materials Science Literature. Nature.",
    "[8] Luo, R. et al. (2022). BioGPT: Generative Pre-trained Transformer for Biomedical Text Generation. Briefings in Bioinformatics.",
  ],
};

async function main() {
  console.log("Generating sample papers...");
  await writePaper("sample_paper_1_transformer_scientific_documents.pdf", paper1);
  console.log("✓ Paper 1: SciTransformer");
  await writePaper("sample_paper_2_cross_modal_knowledge_transfer.pdf", paper2);
  console.log("✓ Paper 2: CrossFlow");
  await writePaper("sample_paper_3_automated_hypothesis_generation.pdf", paper3);
  console.log("✓ Paper 3: HypoGraph");
  console.log("\nAll 3 sample papers saved to /samples/");
}

main();
