import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import llm from "../config/llm.js";
import { roadmapSystemPrompt } from "../prompts/roadmapPrompt.js";
import { searchYouTubeTutorials, getDocumentationArticles } from "../utils/youtube.js";

// Define the state schema using LangGraph Annotation
export const RoadmapState = Annotation.Root({
    role: Annotation(),
    targetRole: Annotation(),
    duration: Annotation(),
    experience: Annotation(),
    package: Annotation(),
    resume: Annotation(),
    modules: Annotation(),
});

// Helper to parse JSON from LLM responses safely
const parseJsonResponse = (text) => {
    const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(clean);
    } catch {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("Invalid roadmap JSON returned by LLM");
    }
};

// Node 1: Roadmap Generation Agent
const roadmapAgent = async (state) => {
    try {
        const targetRole = state.targetRole || state.role || "Full-Stack Software Engineer";
        const duration = state.duration || "3 Months";
        const experience = state.experience || "Fresher";

        let resumeContext = "No resume provided. Assume foundational CS knowledge and structure a full progressive track.";
        if (state.resume && Object.keys(state.resume).length > 0) {
            const r = state.resume;
            const skills = r.skills ? JSON.stringify(r.skills) : "Not listed";
            const currentRole = r.personalInfo?.role || r.experience?.[0]?.role || "Engineering Candidate";
            resumeContext = `Candidate Current Role: ${currentRole}
Current Listed Skills: ${skills}
Experience Summary: ${JSON.stringify(r.experience || [])}
Missing Skills / Improvement Areas: Prioritize modern production tools, concurrency, scaling, and architectural gaps.`;
        }

        const userPrompt = `<target_role>
${String(targetRole).replace(/<\/?target_role>/gi, "")}
</target_role>

<timeline>
${String(duration).replace(/<\/?timeline>/gi, "")}
</timeline>

<experience_level>
${String(experience).replace(/<\/?experience_level>/gi, "")}
</experience_level>

<candidate_context>
${resumeContext.replace(/<\/?candidate_context>/gi, "")}
</candidate_context>

Generate the progressive engineering roadmap modules strictly matching the requested JSON schema.`;

        const response = await llm.invoke([
            new SystemMessage(roadmapSystemPrompt),
            new HumanMessage(userPrompt),
        ]);

        const rawText = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
        const parsed = parseJsonResponse(rawText);

        const modules = (parsed.modules || []).map((m, idx) => ({
            title: m.title || `Module ${idx + 1}`,
            description: m.description || "",
            duration: m.duration || "1-2 Weeks",
            difficulty: ["Beginner", "Intermediate", "Advanced"].includes(m.difficulty)
                ? m.difficulty
                : "Intermediate",
            topics: Array.isArray(m.topics) ? m.topics : [],
            notes: m.notes || "",
            status: "pending",
            resources: {
                youtube: [],
                articles: [],
                notes: m.notes || "",
            },
        }));

        return {
            modules,
            targetRole: parsed.targetRole || targetRole,
            duration: parsed.duration || duration,
        };
    } catch (error) {
        console.error("Error in roadmapAgent:", error);
        // Fallback robust modules in case of LLM parse failure
        return {
            modules: [
                {
                    title: "Core Language & Systems Fundamentals",
                    description: "Master modern idioms, memory management, and asynchronous runtimes.",
                    duration: "2 Weeks",
                    difficulty: "Beginner",
                    topics: ["Syntax & Types", "Event Loop & Memory", "Async Programming", "Testing"],
                    status: "pending",
                    resources: { youtube: [], articles: [], notes: "Focus on clean architecture and idiomatic patterns." },
                },
                {
                    title: "System Architecture & API Design",
                    description: "Design resilient REST & gRPC microservices with robust error boundaries.",
                    duration: "3 Weeks",
                    difficulty: "Intermediate",
                    topics: ["REST & GraphQL", "State Machines", "Caching with Redis", "Docker"],
                    status: "pending",
                    resources: { youtube: [], articles: [], notes: "Learn idempotent endpoints and distributed caching." },
                },
                {
                    title: "Distributed Data & Scalability",
                    description: "Implement database sharding, replication, and high-throughput pipelines.",
                    duration: "3 Weeks",
                    difficulty: "Advanced",
                    topics: ["SQL vs NoSQL", "Indexing & Query Optimization", "Event Streaming", "Monitoring"],
                    status: "pending",
                    resources: { youtube: [], articles: [], notes: "Study horizontal vs vertical scale trade-offs." },
                },
            ],
        };
    }
};

// Node 2: Resource Enrichment Agent
const resourceAgent = async (state) => {
    try {
        const enrichedModules = await Promise.all(
            (state.modules || []).map(async (mod) => {
                const primaryQuery = mod.topics?.[0] ? `${mod.title} ${mod.topics[0]}` : mod.title;
                const ytLinks = await searchYouTubeTutorials(primaryQuery);
                const articleLinks = getDocumentationArticles(mod.title, state.targetRole);

                return {
                    ...mod,
                    resources: {
                        youtube: ytLinks,
                        articles: articleLinks,
                        notes: mod.notes || mod.resources?.notes || "",
                    },
                };
            })
        );

        return { modules: enrichedModules };
    } catch (error) {
        console.error("Error in resourceAgent:", error);
        return { modules: state.modules };
    }
};

// Compile LangGraph StateGraph
const workflow = new StateGraph(RoadmapState)
    .addNode("roadmapAgent", roadmapAgent)
    .addNode("resourceAgent", resourceAgent)
    .addEdge(START, "roadmapAgent")
    .addEdge("roadmapAgent", "resourceAgent")
    .addEdge("resourceAgent", END);

const roadmapGraph = workflow.compile();

export default roadmapGraph;
