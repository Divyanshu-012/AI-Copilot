"use client";

import { useState } from "react";

export default function Home() {

  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const handleAnalyze = async () => {

    if (!file) {
      alert("Upload resume first");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    // Parse resume
    const res = await fetch("/api/parse-resume", {
      method: "POST",
      body: formData
    });

    const resumeData = await res.json();
    setSkills(resumeData.skills);

    // Analyze JD
    const jdRes = await fetch("/api/analyze-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jd })
    });

    const jdData = await jdRes.json();

    // Match skills
    const matchRes = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeSkills: resumeData.skills,
        jdSkills: jdData.jdSkills
      })
    });

    const matchData = await matchRes.json();
    setMatchResult(matchData);

    setLoading(false);
  };

  const generateEmail = async () => {

    if (!matchResult) {
      alert("Analyze resume first");
      return;
    }

    setEmailLoading(true);

    const res = await fetch("/api/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: skills.join(", "),
        jd
      })
    });

    const data = await res.json();
    setEmail(data.email);

    setEmailLoading(false);
  };

  const generateSuggestions = async () => {

    if (!matchResult) return;

    setSuggestLoading(true);

    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missingSkills: matchResult.missing
      })
    });

    const data = await res.json();
    setSuggestions(data.suggestions);

    setSuggestLoading(false);
  };

  return (
    <div className="p-10 max-w-xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        AI Job Application Copilot
      </h1>

      <input
        type="file"
        className="border p-2 w-full"
        onChange={(e) => {
          if (e.target.files) {
            setFile(e.target.files[0]);
          }
        }}
      />

      <textarea
        placeholder="Paste Job Description"
        className="border w-full p-3 mt-4"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
      />

      <button
        className="bg-black text-white px-6 py-3 mt-4"
        onClick={handleAnalyze}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {skills.length > 0 && (
        <div className="mt-6">

          <h2 className="text-xl font-semibold mb-2">
            Detected Resume Skills
          </h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                {skill}
              </span>
            ))}
          </div>

        </div>
      )}

      {matchResult && (
        <div className="mt-8">

          <h2 className="text-xl font-bold mb-2">
            Match Score
          </h2>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${matchResult.score}%` }}
            />
          </div>

          <p className="mt-2 font-semibold">
            {matchResult.score}%
          </p>

          <h3 className="mt-4 font-semibold">Matched Skills</h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {matchResult.matched.map((skill: string) => (
              <span key={skill} className="bg-green-200 px-3 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>

          <h3 className="mt-4 font-semibold">Missing Skills</h3>

          <div className="flex flex-wrap gap-2 mt-2">
            {matchResult.missing.map((skill: string) => (
              <span key={skill} className="bg-red-200 px-3 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-3 mt-6 rounded"
            onClick={generateEmail}
          >
            {emailLoading ? "Generating Email..." : "Generate Recruiter Email"}
          </button>

          <button
            className="bg-purple-600 text-white px-6 py-3 mt-4 ml-2 rounded"
            onClick={generateSuggestions}
          >
            {suggestLoading ? "Generating Suggestions..." : "Get Skill Suggestions"}
          </button>

        </div>
      )}

      {email && (
        <div className="mt-6 p-4 border rounded">

          <h2 className="font-bold text-lg mb-2">
            AI Generated Email
          </h2>

          <p className="whitespace-pre-line mb-4">
            {email}
          </p>

          <button
            className="bg-gray-800 text-white px-4 py-2 rounded"
            onClick={() => navigator.clipboard.writeText(email)}
          >
            Copy Email
          </button>

        </div>
      )}

      {suggestions && (
        <div className="mt-6 p-4 border rounded">

          <h2 className="font-bold text-lg mb-2">
            AI Skill Suggestions
          </h2>

          <p className="whitespace-pre-line">
            {suggestions}
          </p>

        </div>
      )}

    </div>
  );
}
