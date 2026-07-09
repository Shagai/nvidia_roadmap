import type { MonthKnowledge } from "../../types";

export const knowledge202703: MonthKnowledge = {
    monthId: "2027-03",
    thesis:
      "This month packages the work for applications. The task is to make the strongest evidence easy to find, easy to run, and easy to discuss.",
    objectives: [
      "Rewrite CV and LinkedIn around measurable systems work.",
      "Polish GitHub pinned projects and README structure.",
      "Create a one-page portfolio with three technical write-ups.",
      "Prepare target roles, referrals, and application materials.",
    ],
    coreIdeas: [
      {
        title: "Evidence hierarchy",
        body:
          "Recruiters need the headline. Engineers need the artifact. Hiring managers need the narrative. The application package should serve all three without forcing them to dig.",
      },
      {
        title: "CV bullets",
        body:
          "Good bullets name the system, action, measurement, and technical tools. Avoid vague claims like worked on AI. Prefer implemented, profiled, optimized, measured, debugged, and shipped.",
        codeLanguage: "text",
        code: `Implemented CUDA image-processing kernels and optimized memory access patterns,
improving throughput by Xx over CPU baseline on N-sized inputs.`,
      },
      {
        title: "README structure",
        body:
          "Each pinned repository should answer: what it does, why it matters, how to build, how to run, what was measured, what the result means, and what the next improvement would be.",
      },
      {
        title: "Referral strategy",
        body:
          "A useful referral message is short, specific, and linked to evidence. It names the role family and one artifact that matches it.",
      },
    ],
    labs: [
      {
        title: "One-page portfolio",
        body:
          "Create a page with target profile, three projects, three write-ups, open-source artifact, and contact links.",
      },
      {
        title: "Pinned project pass",
        body:
          "For each pinned repo, add a screenshot or diagram, benchmark table, build command, run command, and key tradeoff paragraph.",
      },
      {
        title: "Application packet",
        body:
          "Prepare CV, LinkedIn summary, GitHub profile README, 3-5 target roles, and referral message variants.",
      },
    ],
    pitfalls: [
      "Adding every project instead of the strongest three.",
      "Leaving benchmark claims without reproduction details.",
      "Writing CV bullets without numbers or technical specifics.",
      "Waiting until applications are open to assemble the material.",
    ],
    interviewPrompts: [
      "Walk me through your CUDA performance project.",
      "What does your robotics/vision pipeline prove?",
      "Which project best shows production-quality C++?",
      "What role are you targeting and why?",
    ],
    portfolioEvidence: [
      "NVIDIA-focused CV.",
      "Polished GitHub pinned projects.",
      "One-page portfolio.",
      "Three technical write-ups.",
      "Target role list and outreach drafts.",
    ],
    diaryPrompts: [
      "Which artifact is strongest and why?",
      "What claim on the CV needs better evidence?",
      "What would an engineer inspect first?",
    ],
  };
