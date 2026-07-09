import { Link } from "react-router-dom";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { DetailList } from "../components/DetailList";
import { EssayLayout } from "../components/EssayLayout";
import { Section } from "../components/Section";
import { cudaSources } from "../data/cudaKnowledge";

const sourceById = new Map(cudaSources.map((source) => [source.id, source]));

const sourceIds = ["cccl-runtime-blog", "cccl-runtime-launch", "cccl"];

export function CudaCcclRuntimePage() {
  return (
    <EssayLayout
      eyebrow="CUDA C++ runtime article"
      title="CCCL Runtime And cuda::launch"
      dek="A practical guide to NVIDIA's modern C++ runtime layer: explicit devices, owned and borrowed resources, stream-ordered buffers, typed kernel configurations, and composable launches."
      toc={[
        { id: "model", label: "Runtime model" },
        { id: "walkthrough", label: "Walkthrough" },
        { id: "ownership", label: "Ownership" },
        { id: "async", label: "Async by default" },
        { id: "launch", label: "cuda::launch" },
        { id: "configuration", label: "Configuration" },
        { id: "options", label: "Launch options" },
        { id: "adoption", label: "Adoption" },
        { id: "sources", label: "Sources" },
      ]}
    >
      <Section
        id="model"
        title="The runtime model"
        note="Availability: CCCL 3.2.0 and CUDA Toolkit 13.2. The linked launch guide is on CCCL's unstable documentation track, so recheck the selected version before depending on exact spellings."
      >
        <p>
          CUDA Core Compute Libraries, or CCCL, already brings together host-launched parallel
          algorithms, device-side cooperative algorithms, and CUDA-specific C++ building blocks.
          CCCL Runtime extends that surface with modern C++ APIs for devices, streams, events,
          memory pools, buffers, data movement, and kernel launch.
        </p>
        <p>
          The most important architectural point is that CCCL Runtime is a sibling of the
          traditional CUDA Runtime API. Both are convenience layers over the CUDA Driver API.
          CCCL Runtime does not wrap the traditional runtime and does not require an all-at-once
          rewrite; native handles and non-owning reference types let the two styles interoperate.
        </p>
        <div className="kernel-sync-grid">
          <article>
            <h3>CUDA Driver API</h3>
            <p>
              The low-level foundation that manages contexts, modules, memory, streams, and kernel
              launches.
            </p>
          </article>
          <article>
            <h3>CUDA Runtime API</h3>
            <p>
              The familiar C-style surface with current-device state, raw handles, and status
              codes, commonly used alongside CUDA C++ triple-chevron launch syntax.
            </p>
          </article>
          <article>
            <h3>CCCL Runtime</h3>
            <p>
              A modern C++ alternative built around strong types, explicit dependencies, RAII,
              exceptions, and stream-ordered operations.
            </p>
          </article>
        </div>
        <Callout title="Working mental model" tone="success">
          CCCL Runtime changes how host code expresses CUDA ownership and dependencies. It does not
          change the GPU execution model: kernels still run as grids of blocks and threads, work is
          still asynchronous, and performance still depends on the same hardware resources.
        </Callout>
      </Section>

      <Section
        id="walkthrough"
        title="One program, three explicit stages"
        note="The vector-add shape stays familiar: choose a device and stream, create storage, then configure and launch the kernel."
      >
        <p>
          A small CCCL Runtime program reads top to bottom without hidden device selection. The
          stream names its device, the buffers name both their stream and memory pool, and the
          launch names its stream and configuration. The final synchronization is the explicit
          host boundary where the program needs the queued GPU work to be complete.
        </p>
        <CodeBlock language="cuda" showLineNumbers title="cccl_vector_add.cu">{`#include <cuda/buffer>
#include <cuda/devices>
#include <cuda/launch>
#include <cuda/memory_pool>
#include <cuda/std/span>
#include <cuda/stream>

struct add_values {
    template <class Config>
    __device__ void operator()(
        Config config,
        cuda::std::span<const int> left,
        cuda::std::span<const int> right,
        cuda::std::span<int> output) const
    {
        auto tid = cuda::gpu_thread.rank(cuda::grid, config);
        if (tid < output.size()) {
            output[tid] = left[tid] + right[tid];
        }
    }
};

void run_vector_add()
{
    cuda::device_ref device = cuda::devices[0];
    cuda::stream stream{device};
    auto pool = cuda::device_default_memory_pool(device);

    int count = 4096;
    auto left = cuda::make_buffer<int>(stream, pool, count, 4);
    auto right = cuda::make_buffer<int>(stream, pool, count, 7);
    auto output = cuda::make_buffer<int>(stream, pool, count, cuda::no_init);

    auto config = cuda::distribute<256>(count);
    cuda::launch(stream, config, add_values{}, left, right, output);

    stream.sync();
}`}</CodeBlock>
        <div className="answer-grid">
          <article className="answer-card">
            <h3>1. Device and stream</h3>
            <p>
              <code>cuda::stream&#123;device&#125;</code> makes the association visible at the
              construction site instead of relying on a current device.
            </p>
          </article>
          <article className="answer-card">
            <h3>2. Pool and buffers</h3>
            <p>
              <code>make_buffer</code> schedules allocation and initialization. The output uses
              <code> cuda::no_init</code> because the kernel overwrites every valid element.
            </p>
          </article>
          <article className="answer-card">
            <h3>3. Configuration and launch</h3>
            <p>
              <code>distribute&lt;256&gt;(count)</code> creates enough threads in 256-thread blocks;
              the bounds check remains necessary for guard threads.
            </p>
          </article>
        </div>
      </Section>

      <Section
        id="ownership"
        title="Strong types make ownership visible"
        note="Owning objects manage lifetime. Types ending in _ref borrow a resource whose lifetime is managed elsewhere."
      >
        <p>
          CCCL Runtime uses the same distinction that C++ programmers know from
          <code> std::string</code> and <code>std::string_view</code>. A <code>cuda::stream</code>
          owns its native stream and destroys it in its destructor. A
          <code> cuda::stream_ref</code> is a small, trivially copyable borrowed view. The same
          pattern is used for events, memory pools, and other runtime objects; a device is only a
          reference because there is no device lifetime for the object to own.
        </p>
        <div className="kernel-sync-grid">
          <article>
            <h3>Strong identity</h3>
            <p>
              A device is a <code>device_ref</code>, not an integer with context-dependent meaning.
              A stream is a typed object, not an unannotated pointer-like handle.
            </p>
          </article>
          <article>
            <h3>Local dependencies</h3>
            <p>
              Constructors and functions receive the device, stream, or pool they depend on. A
              reader does not have to reconstruct hidden global state.
            </p>
          </article>
          <article>
            <h3>Borrowed interoperability</h3>
            <p>
              Existing native handles can be viewed through <code>_ref</code> types, while
              <code> .get()</code> exposes a native handle for legacy APIs.
            </p>
          </article>
        </div>
        <CodeBlock language="cuda">{`void submit_work(cuda::stream_ref stream);

void bridge_existing_code(cudaStream_t native_stream)
{
    cuda::stream_ref borrowed{native_stream};
    submit_work(borrowed);

    cudaStream_t same_handle = borrowed.get();
    use_legacy_cuda_api(same_handle);
}`}</CodeBlock>
        <p>
          Ownership transfer is deliberately louder. Use
          <code> cuda::stream::from_native_handle</code> only when the CCCL object should take over
          destruction, and use <code>.release()</code> when returning that responsibility to other
          code. Borrow with <code>stream_ref</code> when ownership is not actually moving.
        </p>
        <Callout title="Default-stream boundary" tone="warning">
          CCCL Runtime does not expose its own default stream, and streams it creates are
          non-blocking. A legacy default-stream handle can be wrapped, but code that depends on
          default-stream semantics is clearer when it stays on the traditional CUDA Runtime API.
        </Callout>
      </Section>

      <Section
        id="async"
        title="Asynchronous by default"
        note="The convention is simple: when a runtime operation takes a stream first, it is ordered on that stream."
      >
        <p>
          CCCL Runtime does not split common operations into separately named synchronous and
          asynchronous variants. Stream-first APIs enqueue work. This makes memory-pool allocation,
          initialization, copies, kernel execution, and deallocation fit the same dependency model
          without inserting host waits between stages.
        </p>
        <div className="kernel-sync-grid">
          <article>
            <h3>Allocate and initialize</h3>
            <p>
              <code>make_buffer</code> orders allocation and initialization on its stream and
              requires initialization unless the caller explicitly chooses
              <code> cuda::no_init</code>.
            </p>
          </article>
          <article>
            <h3>Use in stream order</h3>
            <p>
              Launches and data movement submitted later to the same stream observe the earlier
              buffer setup without a host-side synchronization.
            </p>
          </article>
          <article>
            <h3>Destroy in stream order</h3>
            <p>
              A buffer remembers a stream for deallocation. Use <code>set_stream()</code> or an
              explicit <code>destroy(stream)</code> when the usage order changes.
            </p>
          </article>
        </div>
        <p>
          Initialization-by-default prevents an easy class of uninitialized-memory bugs. The
          explicit <code>no_init</code> escape hatch is appropriate when subsequent work completely
          overwrites the allocation. The default device memory pool is the normal starting point;
          separate pools remain available when their settings need to differ.
        </p>
        <CodeBlock language="cuda">{`#include <exception>
#include <iostream>

int main() try
{
    run_vector_add();
    return 0;
}
catch (const std::exception& error)
{
    std::cerr << "CUDA work failed: " << error.what() << '\\n';
    return 1;
}`}</CodeBlock>
        <Callout title="Exceptions do not make asynchronous work synchronous">
          CCCL Runtime uses exceptions instead of unchecked status returns, but completion errors
          can still surface at an observation boundary. Keep <code>stream.sync()</code> inside the
          <code> try</code> block when the host must know that queued work finished successfully.
        </Callout>
      </Section>

      <Section
        id="launch"
        title="The anatomy of cuda::launch"
        note="Read every call as three groups: the stream, the typed configuration, then the kernel and its arguments."
      >
        <CodeBlock language="cuda">{`cuda::launch(stream, config, kernel, arguments...);`}</CodeBlock>
        <div className="kernel-sync-grid">
          <article>
            <h3>Where</h3>
            <p>
              The first argument is the stream that orders the launch and makes the target device
              dependency explicit.
            </p>
          </article>
          <article>
            <h3>How</h3>
            <p>
              A <code>kernel_config</code> carries grid, optional cluster, and block hierarchy plus
              options such as dynamic shared memory or cooperative launch.
            </p>
          </article>
          <article>
            <h3>What</h3>
            <p>
              The final group contains a <code>__global__</code> function or device-callable object
              followed by the arguments consumed by the kernel.
            </p>
          </article>
        </div>
        <p>
          A kernel may accept the configuration as its first device-side parameter. For ordinary
          kernel functions and functors, <code>cuda::launch</code> supplies it automatically when
          the signature asks for it. This is how compile-time information encoded at the host
          launch site becomes available to device code without passing the configuration twice.
        </p>
        <CodeBlock language="cuda">{`#include <cuda/launch>
#include <cstdio>

struct print_one_thread {
    template <class Config>
    __device__ void operator()(Config config, unsigned int selected) const
    {
        if (cuda::gpu_thread.rank(cuda::grid, config) == selected) {
            printf("selected thread\\n");
        }
    }
};

auto config = cuda::make_config(
    cuda::block_dims<128>(),
    cuda::grid_dims(4));

cuda::launch(stream, config, print_one_thread{}, 42);`}</CodeBlock>
        <div className="cuda-optimization-table-wrap">
          <table className="cuda-optimization-table">
            <thead>
              <tr>
                <th scope="col">Kernel form</th>
                <th scope="col">Configuration flow</th>
                <th scope="col">Template behavior</th>
                <th scope="col">Main caveat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Templated __global__ function</th>
                <td>Automatic when the first parameter accepts the configuration.</td>
                <td>A configuration-dependent function template needs an explicit specialization.</td>
                <td>
                  Pass a specialization such as <code>kernel&lt;decltype(config)&gt;</code>.
                </td>
              </tr>
              <tr>
                <th scope="row">Kernel functor</th>
                <td>Automatic when the call operator accepts the configuration.</td>
                <td>The templated device call operator can be deduced from the arguments.</td>
                <td>The functor must expose a device-callable operator.</td>
              </tr>
              <tr>
                <th scope="row">Extended device lambda</th>
                <td>Not injected automatically.</td>
                <td>The lambda's parameter types define what is accepted.</td>
                <td>Pass config once for launch and again as the first kernel argument.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <CodeBlock language="cuda">{`// Function template: instantiate it explicitly.
cuda::launch(stream, config, function_kernel<decltype(config)>, 42);

// Functor: template parameters are deduced.
cuda::launch(stream, config, kernel_functor{}, 42);

// Extended device lambda: configuration appears twice.
cuda::launch(stream, config, device_lambda, config, 42);`}</CodeBlock>
        <p>
          Arguments can also be adapted at the launch boundary. A <code>cuda::buffer</code> owns its
          allocation, but a kernel parameter must be trivially copyable, so the launch transforms
          a buffer into a <code>cuda::std::span</code>. The device signature describes the borrowed
          view it uses rather than pretending to own host-side resource state.
        </p>
      </Section>

      <Section
        id="configuration"
        title="Configuration is both data and type information"
        note="Create kernel_config objects with cuda::make_config; do not construct the representation directly."
      >
        <p>
          A <code>cuda::kernel_config</code> combines CUDA thread hierarchy dimensions—grid,
          optional cluster, and block—with launch options. The grid size can be a runtime value
          while a descriptor such as
          <code> cuda::block_dims&lt;256&gt;()</code> puts the block size in the configuration type. The
          device can then use that static fact for specialization or compile-time validation.
        </p>
        <CodeBlock language="cuda">{`int blocks = choose_grid_size(problem_size);

auto config = cuda::make_config(
    cuda::block_dims<256>(),
    cuda::grid_dims(blocks));

struct checked_kernel {
    template <class Config>
    __device__ void operator()(Config config) const
    {
        static_assert(cuda::gpu_thread.static_dims(cuda::block, config).x == 256);
        static_assert(cuda::gpu_thread.static_dims(cuda::block, config).y == 1);
        static_assert(cuda::gpu_thread.static_dims(cuda::block, config).z == 1);
    }
};`}</CodeBlock>
        <p>
          <code>make_config</code> accepts either an already-built hierarchy plus options or direct
          dimension descriptors followed by options. In the direct form, all hierarchy dimensions
          must come before every launch option.
        </p>
        <CodeBlock language="cuda">{`auto base = cuda::make_config(
    cuda::block_dims<128>(),
    cuda::grid_dims(512),
    cuda::dynamic_shared_memory<float[]>(1024));

auto cooperative = cuda::make_config(
    cuda::grid_dims(256),
    cuda::cooperative_launch{});

// The receiver wins when dimensions or option types conflict.
auto combined = cooperative.combine(base);`}</CodeBlock>
        <DetailList
          title="Configuration operations"
          items={[
            "hierarchy() exposes the grid, optional cluster, and block hierarchy.",
            "options() exposes the attached launch options.",
            "combine(other) merges configurations; the receiver wins overlapping hierarchy levels or duplicate option types.",
            "A kernel functor can provide default_config() for reusable launch defaults.",
            "combine_with_default(kernel) lets the call-site configuration fill or override those defaults.",
          ]}
        />
        <Callout title="Composition rule" tone="success">
          Put reusable defaults near the kernel, then let the call site state the choices that
          vary. Validate hard kernel requirements explicitly—for example with a device-side
          <code> static_assert</code>. When reading <code>a.combine(b)</code>, remember that
          <code> a</code> has priority where the two conflict.
        </Callout>
      </Section>

      <Section
        id="options"
        title="Launch options carry more than dimensions"
        note="The launch guide documents cooperative execution, typed dynamic shared memory, per-launch priority, and stream-ordered host callables."
      >
        <div className="answer-grid">
          <article className="answer-card">
            <h3>Cooperative launch</h3>
            <p>
              <code>cuda::cooperative_launch&#123;&#125;</code> enables grid-wide cooperative-group
              synchronization and restricts the grid to the device's concurrently executable
              block capacity.
            </p>
          </article>
          <article className="answer-card">
            <h3>Dynamic shared memory</h3>
            <p>
              <code>cuda::dynamic_shared_memory&lt;T&gt;</code> makes both the element type and the
              requested storage part of the configuration instead of passing an untyped byte count.
            </p>
          </article>
          <article className="answer-card">
            <h3>Launch priority</h3>
            <p>
              <code>cuda::launch_priority&#123;p&#125;</code> sets priority for this launch and overrides
              the priority inherited from its stream.
            </p>
          </article>
        </div>
        <CodeBlock language="cuda">{`template <class Config>
__global__ void reduce_tile(Config config)
{
    auto tile = cuda::dynamic_shared_memory(config);
    // For float[], tile is a span-like view over the requested elements.
}

auto config = cuda::make_config(
    cuda::block_dims<128>(),
    cuda::grid_dims(blocks),
    cuda::dynamic_shared_memory<float[]>(elements_per_block),
    cuda::launch_priority{0});

cuda::launch(stream, config, reduce_tile<decltype(config)>);`}</CodeBlock>
        <DetailList
          title="Dynamic shared-memory forms"
          items={[
            "For one non-array object T, provide no size; device code receives a T reference.",
            "For a bounded array T[n], provide no size because the extent is already in the type.",
            "For an unbounded array T[], pass the number of elements; device code receives a span-like view.",
            "Requests above the portable 48 KiB-per-block limit require the explicit cuda::non_portable opt-in and still depend on target-device support.",
          ]}
        />
        <p>
          <code>cuda::host_launch</code> is the related stream-ordered path for host work. It queues
          a host-callable object after earlier work in the stream, stores the callable and arguments
          by value for later execution, and normally needs a dynamic allocation for that storage.
        </p>
        <CodeBlock language="cuda">{`cuda::host_launch(stream, [](int batch) {
    std::cout << "batch " << batch << " completed\\n";
}, batch_id);

stream.sync();`}</CodeBlock>
        <Callout title="Host callback lifetime" tone="warning">
          A function pointer or a <code>cuda::std::reference_wrapper</code> with no arguments can
          avoid the callback-storage allocation. The trade is a lifetime obligation: referenced
          callables and captured references must remain valid until the stream reaches the callback.
        </Callout>
      </Section>

      <Section
        id="adoption"
        title="Adopt it at an explicit boundary"
        note="Incremental adoption is a feature: move one ownership or launch boundary at a time and keep surrounding native-handle code working."
      >
        <DetailList
          title="A practical migration path"
          ordered
          items={[
            "Confirm the build uses CCCL 3.2.0 or newer and CUDA Toolkit 13.2 or newer.",
            "Wrap an existing native stream with stream_ref so ownership stays where it already lives.",
            "Replace implicit current-device selection with an explicit device_ref at the new boundary.",
            "Move one allocation path to a memory pool and make_buffer; use no_init only when a complete overwrite is guaranteed.",
            "Express one triple-chevron launch as make_config plus cuda::launch and preserve the same bounds checks.",
            "Keep a sync or result-consumption boundary inside the exception handler so completion failures are observed.",
            "Only then consider kernel functors, configuration defaults, or advanced launch options where they simplify real code.",
          ]}
        />
        <Callout title="When to keep the traditional runtime">
          Keep existing code where default-stream semantics are intentional, the deployed toolkit is
          older than CUDA 13.2, a C-facing interface is the real compatibility boundary, or the
          typed abstraction does not yet repay migration cost. Interoperability means a mixed codebase
          can still be a deliberate design.
        </Callout>
        <p>
          For the execution mechanics underneath either syntax, revisit the
          <Link to="/cuda-kb/execution-model#syntax"> execution-model launch guide</Link>. For the
          block, shared-memory, and synchronization rules that the new configuration still obeys,
          use the <Link to="/cuda-kb/kernels#kernel-shape">kernel guide</Link> and
          <Link to="/cuda-kb/syncthreads"> __syncthreads() article</Link>.
        </p>
        <p className="month-nav">
          <Link to="/cuda-kb#glossary">Back to glossary</Link>
          <Link to="/cuda-kb#pillars">Libraries and ecosystem</Link>
          <Link to="/cuda-lab">Build a CUDA lab</Link>
        </p>
      </Section>

      <Section
        id="sources"
        title="Source anchors"
        note="The NVIDIA blog provides the runtime design and end-to-end example. The unstable CCCL launch guide is the detailed API source and may evolve."
      >
        <div className="reference-grid">
          {sourceIds.map((sourceId) => {
            const source = sourceById.get(sourceId);
            if (!source) return null;

            return (
              <a className="reference-card" href={source.url} key={source.id}>
                <strong>{source.label}</strong>
                <span>{source.scope}</span>
                <small>Checked {source.checked}</small>
              </a>
            );
          })}
        </div>
      </Section>
    </EssayLayout>
  );
}
