import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { DetailList } from "../components/DetailList";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";

const convolutionExamples = [
  {
    input: "input = [1, 2, 3, 4, 5], kernel = [1, 0, -1]",
    output: "output = [-2, -2, -2]",
    reason: "Each window subtracts the third value from the first value.",
  },
  {
    input: "input = [2, 4, 6, 8], kernel = [0.5, 0.2]",
    output: "output = [1.8, 3.2, 4.6]",
    reason: "The valid output length is 4 - 2 + 1 = 3.",
  },
];

export function CudaKernelExamplesPage() {
  return (
    <EssayLayout
      eyebrow="CUDA kernel examples"
      title="Solving CUDA kernel examples"
      dek="A worked notebook for turning problem statements into CUDA kernels. The first example is valid 1D convolution."
      toc={[
        { id: "problem", label: "Problem" },
        { id: "indexing", label: "Indexing" },
        { id: "baseline", label: "Baseline kernel" },
        { id: "launch", label: "Launch" },
        { id: "shared-memory", label: "Shared memory" },
        { id: "validate", label: "Validate" },
        { id: "mistakes", label: "Mistakes" },
        { id: "next", label: "Next" },
      ]}
    >
      <Section
        id="problem"
        title="1D convolution with a valid boundary"
        note="Valid means the kernel is applied only where it fully overlaps the input."
      >
        <p>
          The input has two arrays: <code>input</code>, a 1D array of 32-bit floating-point numbers,
          and <code>kernel</code>, a 1D array of 32-bit floating-point filter values. The result is
          written to <code>output</code>, whose length is{" "}
          <code>input_size - kernel_size + 1</code>.
        </p>

        <ConvolutionFigure />

        <div className="kernel-example-fact-grid">
          <article>
            <span>Work item</span>
            <strong>One output element</strong>
            <p>
              Thread <code>i</code> computes <code>output[i]</code>.
            </p>
          </article>
          <article>
            <span>Read window</span>
            <strong>
              <code>input[i + j]</code>
            </strong>
            <p>
              The thread walks <code>j = 0</code> through <code>kernel_size - 1</code>.
            </p>
          </article>
          <article>
            <span>Output length</span>
            <strong>
              <code>N - K + 1</code>
            </strong>
            <p>
              The last valid start is <code>input_size - kernel_size</code>.
            </p>
          </article>
        </div>

        <Callout title="Use the prompt's formula" tone="warning">
          <p>
            This exercise uses <code>input[i + j] * kernel[j]</code>. Do not reverse the kernel
            unless the prompt explicitly asks for mathematical convolution with a flipped filter.
          </p>
        </Callout>
      </Section>

      <Section id="indexing" title="Translate the math to thread indexing">
        <p>
          The direct mapping is simple: launch enough threads for the valid output length, let each
          thread guard its own <code>i</code>, and keep the accumulation private to that thread.
        </p>
        <div className="kernel-example-index-grid">
          <article>
            <h3>Output index</h3>
            <CodeBlock>{`int i = blockIdx.x * blockDim.x + threadIdx.x;
if (i >= output_size) return;`}</CodeBlock>
          </article>
          <article>
            <h3>Private accumulation</h3>
            <CodeBlock>{`float sum = 0.0f;
for (int j = 0; j < kernel_size; ++j) {
    sum += input[i + j] * kernel[j];
}
output[i] = sum;`}</CodeBlock>
          </article>
        </div>
        <DetailList
          title="Mental model"
          items={[
            "Parallelize across output positions, not across the inner filter loop at first.",
            "Each thread reads a contiguous input window and the same filter values as neighboring threads.",
            "The only boundary check needed in the baseline kernel is whether the output index is valid.",
          ]}
        />
      </Section>

      <Section
        id="baseline"
        title="Baseline CUDA kernel"
        note="This is the correctness-first version. It is the right first pass before optimizing memory traffic."
      >
        <CodeBlock>{`__global__ void conv1d_valid_kernel(
    const float* input,
    const float* kernel,
    float* output,
    int output_size,
    int kernel_size)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;

    if (i >= output_size)
    {
        return;
    }

    float sum = 0.0f;
    for (int j = 0; j < kernel_size; ++j)
    {
        sum += input[i + j] * kernel[j];
    }

    output[i] = sum;
}`}</CodeBlock>
        <DetailList
          title="Why this works"
          items={[
            "The constraints guarantee kernel_size <= input_size, so output_size is at least 1.",
            "For the last output element, i = input_size - kernel_size, so i + kernel_size - 1 is input_size - 1.",
            "No thread writes the same output element as another thread.",
          ]}
        />
      </Section>

      <Section id="launch" title="Launch from solve">
        <p>
          The challenge usually requires the <code>solve</code> signature to remain unchanged. Keep
          that wrapper stable and launch your implementation from inside it.
        </p>
        <CodeBlock>{`void solve(
    const float* input,
    const float* kernel,
    float* output,
    int input_size,
    int kernel_size)
{
    int output_size = input_size - kernel_size + 1;
    int threads_per_block = 256;
    int blocks = (output_size + threads_per_block - 1) / threads_per_block;

    conv1d_valid_kernel<<<blocks, threads_per_block>>>(
        input,
        kernel,
        output,
        output_size,
        kernel_size);

    cudaDeviceSynchronize();
}`}</CodeBlock>
        <Callout title="Harness assumption" tone="success">
          <p>
            Many CUDA exercise harnesses pass device pointers into <code>solve</code>. If your local
            harness passes host pointers instead, keep the same kernel and add the usual
            <code> cudaMalloc</code>, <code>cudaMemcpy</code>, and cleanup around this launch.
          </p>
        </Callout>
      </Section>

      <Section
        id="shared-memory"
        title="Shared-memory upgrade"
        note="The maximum case is input_size = 1,500,000 and kernel_size = 2,047, so memory reuse matters."
      >
        <p>
          Neighboring output windows overlap heavily. A block of 256 neighboring output elements
          needs only <code>256 + kernel_size - 1</code> input values. The optimized version below
          stages that input tile and the filter in dynamic shared memory.
        </p>
        <CodeBlock>{`__global__ void conv1d_valid_shared_kernel(
    const float* input,
    const float* kernel,
    float* output,
    int output_size,
    int kernel_size)
{
    extern __shared__ float shared[];

    int tx = threadIdx.x;
    int block_start = blockIdx.x * blockDim.x;
    int tile_width = blockDim.x + kernel_size - 1;
    int input_size = output_size + kernel_size - 1;

    float* input_tile = shared;
    float* kernel_tile = input_tile + tile_width;

    for (int offset = tx; offset < tile_width; offset += blockDim.x)
    {
        int input_index = block_start + offset;
        input_tile[offset] = input_index < input_size ? input[input_index] : 0.0f;
    }

    for (int offset = tx; offset < kernel_size; offset += blockDim.x)
    {
        kernel_tile[offset] = kernel[offset];
    }

    __syncthreads();

    int i = block_start + tx;
    if (i < output_size)
    {
        float sum = 0.0f;
        for (int j = 0; j < kernel_size; ++j)
        {
            sum += input_tile[tx + j] * kernel_tile[j];
        }

        output[i] = sum;
    }
}`}</CodeBlock>
        <CodeBlock>{`void solve(
    const float* input,
    const float* kernel,
    float* output,
    int input_size,
    int kernel_size)
{
    int output_size = input_size - kernel_size + 1;
    int threads_per_block = 256;
    int blocks = (output_size + threads_per_block - 1) / threads_per_block;
    int tile_width = threads_per_block + kernel_size - 1;
    size_t shared_bytes = (tile_width + kernel_size) * sizeof(float);

    conv1d_valid_shared_kernel<<<blocks, threads_per_block, shared_bytes>>>(
        input,
        kernel,
        output,
        output_size,
        kernel_size);

    cudaDeviceSynchronize();
}`}</CodeBlock>
        <DetailList
          title="Optimization logic"
          items={[
            "The input tile load turns overlapping global reads into shared-memory reuse inside the block.",
            "The filter load lets all threads in the block reuse the same kernel values from shared memory.",
            "The barrier is after both cooperative loads, before any thread reads the staged values.",
            "Do not return before the barrier; out-of-range output threads still help load shared memory.",
          ]}
        />
      </Section>

      <Section id="validate" title="Validate before timing">
        <p>
          Start with tiny arrays where the arithmetic is visible, then move to edge sizes and random
          tests against a CPU reference.
        </p>
        <div className="kernel-example-table-wrap">
          <table className="kernel-example-table">
            <thead>
              <tr>
                <th scope="col">Input</th>
                <th scope="col">Expected output</th>
                <th scope="col">Reason</th>
              </tr>
            </thead>
            <tbody>
              {convolutionExamples.map((example) => (
                <tr key={example.input}>
                  <td>
                    <code>{example.input}</code>
                  </td>
                  <td>
                    <code>{example.output}</code>
                  </td>
                  <td>{example.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock>{`void conv1d_cpu(
    const float* input,
    const float* kernel,
    float* output,
    int input_size,
    int kernel_size)
{
    int output_size = input_size - kernel_size + 1;

    for (int i = 0; i < output_size; ++i)
    {
        float sum = 0.0f;
        for (int j = 0; j < kernel_size; ++j)
        {
            sum += input[i + j] * kernel[j];
        }
        output[i] = sum;
    }
}`}</CodeBlock>
      </Section>

      <Section id="mistakes" title="Mistakes to avoid">
        <div className="answer-grid">
          <article className="answer-card">
            <h3>Launching too many logical outputs</h3>
            <p>
              The grid covers <code>output_size</code>, not <code>input_size</code>. Extra threads
              would read past the final valid window unless guarded carefully.
            </p>
          </article>
          <article className="answer-card">
            <h3>Flipping the filter</h3>
            <p>
              The prompt defines <code>kernel[j]</code>. A reversed filter changes the answers for
              asymmetric kernels such as <code>[1, 0, -1]</code>.
            </p>
          </article>
          <article className="answer-card">
            <h3>Returning before a barrier</h3>
            <p>
              In the shared-memory kernel, every thread in the block must reach{" "}
              <code>__syncthreads()</code>. Put the output guard after the cooperative loads and the
              barrier.
            </p>
          </article>
        </div>
      </Section>

      <Section id="next" title="Next kernel examples">
        <DetailList
          title="Good follow-ups"
          ordered
          items={[
            "Add a constant-memory version when the filter is copied from host code.",
            "Extend this to 2D valid convolution and reason about halo loading.",
            "Compare naive, shared-memory, and library-style implementations with Nsight Compute.",
          ]}
        />
        <p className="month-nav">
          <Link to="/cuda-lab">Back to CUDA lab</Link>
          <Link to="/cuda-kb/kernels">Kernel concepts</Link>
          <Link to="/cuda-kb/execution-model">Execution model</Link>
        </p>
      </Section>
    </EssayLayout>
  );
}

function ConvolutionFigure() {
  return (
    <figure className="conv-figure" aria-label="Valid 1D convolution window over input values">
      <div className="conv-row">
        <span className="conv-label">input</span>
        <div className="conv-cells">
          {[1, 2, 3, 4, 5].map((value, index) => (
            <span className={index < 3 ? "is-window" : undefined} key={value}>
              {value}
            </span>
          ))}
        </div>
      </div>
      <div className="conv-row">
        <span className="conv-label">kernel</span>
        <div className="conv-cells conv-kernel-cells">
          {[1, 0, -1].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      </div>
      <p className="conv-equation">1 x 1 + 2 x 0 + 3 x (-1) = -2</p>
      <div className="conv-output-row">
        <span className="conv-label">output</span>
        <span className="conv-output-cell">-2</span>
        <span className="conv-muted">then slide one position</span>
      </div>
      <figcaption>
        For <code>output[0]</code>, the valid window is <code>input[0]</code> through{" "}
        <code>input[2]</code>. The next output starts at <code>input[1]</code>.
      </figcaption>
    </figure>
  );
}
