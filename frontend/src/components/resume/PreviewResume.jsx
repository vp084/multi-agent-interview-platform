import React, { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiCopy } from 'react-icons/fi'
import DownloadBtn from './DownloadBtn'
import ATSTemplate from './ATSTemplate'

function PreviewResume({ data, onBack, user, setUser }) {
    const resumeRef = useRef(null)
    const [scale, setScale] = useState(1)

    useEffect(() => {
        const updateScale = () => {
            if (window.innerWidth < 640) {
                setScale(0.42);
            } else if (window.innerWidth < 768) {
                setScale(0.58);
            } else if (window.innerWidth < 1024) {
                setScale(0.72);
            } else {
                setScale(0.9);
            }
        };

        updateScale();

        window.addEventListener("resize", updateScale);

        return () =>
            window.removeEventListener("resize", updateScale);

    const [copied, setCopied] = useState(false);

    const handleCopyPlainText = () => {
        if (!data) return;
        const lines = [];
        if (data.personal?.fullName) lines.push(data.personal.fullName.toUpperCase());
        const contact = [
            data.personal?.email,
            data.personal?.phone,
            data.personal?.location,
            data.personal?.linkedIn,
            data.personal?.github,
        ].filter(Boolean).join(" | ");
        if (contact) lines.push(contact);

        if (data.personal?.summary) {
            lines.push("\n--- SUMMARY ---\n" + data.personal.summary);
        }
        if (data.skills) {
            const skillStr = typeof data.skills === "string" ? data.skills : Array.isArray(data.skills) ? data.skills.map(s => typeof s === "string" ? s : s.name || s.skills).filter(Boolean).join(", ") : "";
            if (skillStr) lines.push("\n--- TECHNICAL SKILLS ---\n" + skillStr);
        }
        if (data.experience?.length) {
            lines.push("\n--- WORK EXPERIENCE ---");
            data.experience.forEach(exp => {
                lines.push(`\n${exp.role || exp.title || "Software Engineer"} | ${exp.company || ""} (${exp.duration || exp.startDate || ""})`);
                if (exp.description) lines.push(exp.description);
            });
        }
        if (data.projects?.length) {
            lines.push("\n--- PROJECTS ---");
            data.projects.forEach(proj => {
                lines.push(`\n${proj.title || proj.name}${proj.techStack ? " [" + proj.techStack + "]" : ""}`);
                if (proj.description) lines.push(proj.description);
            });
        }
        if (data.education?.length) {
            lines.push("\n--- EDUCATION ---");
            data.education.forEach(edu => {
                lines.push(`${edu.degree || ""} | ${edu.school || edu.institution || ""} (${edu.year || edu.duration || ""})`);
            });
        }

        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
    };

    return (
        <div className='min-h-screen bg-white text-[#0A0A0A]'>
            {/* header */}
            <div className='sticky top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl'>
                <div className='mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
                    <div>
                        <h2 className='text-base font-bold sm:text-lg'>Resume Preview</h2>
                        <p className='mt-0.5 text-[10px] text-gray-400 sm:text-xs'>
                            Review your resume before downloading or exporting for ATS portals
                        </p>
                    </div>

                    <div className='flex items-center justify-between lg:justify-end gap-2.5'>
                        <button onClick={onBack} className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/15 px-2.5 sm:px-3 text-xs text-black/60 transition hover:border-black/35 hover:text-[#0A0A0A]'>
                            <FiArrowLeft size={15} />
                            <span className='hidden sm:block'>Back to Edit</span>
                        </button>
                        <button
                            onClick={handleCopyPlainText}
                            className='flex h-8 items-center justify-center gap-1.5 rounded-lg border border-black/15 bg-white px-2.5 sm:px-3 text-xs text-black transition hover:bg-gray-50'
                            title="Copy structured plain text for Workday & Taleo application portals"
                        >
                            <FiCopy size={13} />
                            <span>{copied ? "Copied Plaintext!" : "Copy ATS Text"}</span>
                        </button>
                        <DownloadBtn docRef={resumeRef} user={user} setUser={setUser} />
                    </div>


                </div>
            </div>


            {/* Template */}
            <div className='overflow-auto bg-[#F8F9FA] px-3 py-4 sm:px-6 sm:py-8'>
                <div className='mx-auto flex justify-center'>
                    <div style={{
                        transform: `scale(${scale})`,
                        transformOrigin: "top center"
                    }}
                    >
                        <div ref={resumeRef} className='rounded-md bg-white shadow-[0_0_50px_rgba(0,0,0,.6)]'>
                            <ATSTemplate data={data}/>
                        </div>

                    </div>

                </div>

            </div>



        </div>
    )
}

export default PreviewResume
