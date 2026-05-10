import { Callout } from "../components/Callout";
import { CudaExecutionVisualizer } from "../components/CudaExecutionVisualizer";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";

export function CudaLabPage() {
  return (
    <EssayLayout
      eyebrow="CUDA intuition lab"
      title="Grid, block, thread, and warp intuition"
      dek="A small visual model for reasoning about how many threads run and why memory access can dominate performance."
      toc={[
        { id: "mental-model", label: "Mental model" },
        { id: "visualizer", label: "Visualizer" },
        { id: "code", label: "Code shape" },
        { id: "next", label: "Next action" },
      ]}
    >
      <Section id="mental-model" title="Mental model">
        <p>
          CUDA starts to feel less mysterious when I separate the launch shape from the performance
          story. Blocks and threads define the work shape. Warps, memory access, divergence,
          synchronization, and resource use determine how efficiently the GPU runs it.
        </p>
      </Section>

      <Section id="visualizer" title="Interactive execution visualizer">
        <CudaExecutionVisualizer />
      </Section>

      <Section id="code" title="Code shape">
        <pre className="code-block">{`dim3 block(threads_per_block);
dim3 grid((n + block.x - 1) / block.x);

kernel<<<grid, block>>>(input, output, n);

// Interview question:
// Are the accesses coalesced? What limits the kernel:
// memory bandwidth, compute, occupancy, divergence, or synchronization?`}</pre>
      </Section>

      <Section id="next" title="Next action">
        <Callout title="Portfolio evidence">
          In the CUDA image-processing repo, include one naive kernel and one optimized kernel. Show
          what changed in runtime and explain why.
        </Callout>
      </Section>
    </EssayLayout>
  );
}
