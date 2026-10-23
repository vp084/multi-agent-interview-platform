import { Annotation } from "@langchain/langgraph";


const InterviewState = Annotation.Root({
    action: Annotation(),

    type: Annotation(),
    length: Annotation(),
    totalQuestions: Annotation(),
    phase: Annotation(),
    questionType: Annotation(),

    role: Annotation(),

    useResume: Annotation(),

    resume: Annotation(),
    pastQuestions: Annotation(),
    pastTopics: Annotation(),

    questions: Annotation(),

    question: Annotation(),

    answer: Annotation(),

    difficulty: Annotation(),

    keyPoints: Annotation(),

    feedback: Annotation(),

    overallScore: Annotation(),
    phaseScores: Annotation(),

    report: Annotation(),

    completed: Annotation(),
})


export default InterviewState