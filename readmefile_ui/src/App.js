import { useState } from "react";
import { Github, FileText, Download, Sparkles, Zap, Copy, Check } from "lucide-react";

export default function ReadmeGenerator() {
  const [githubLink, setGithubLink] = useState("");
  const [readmeContent, setReadmeContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setReadmeContent("");
    try {
      const response = await fetch("http://127.0.0.1:5125/generate-readme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: githubLink }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate README");
      }
      const data = await response.json();
      setReadmeContent(data.readme || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([readmeContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "README.md";
    link.href = url;
    link.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(readmeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <Github className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight">
                README
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {" "}Generator
                </span>
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Transform your GitHub repositories into professional documentation with AI-powered README generation
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 transition-all duration-500 hover:shadow-purple-500/20">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Github className="w-5 h-5 text-purple-300" />
                </div>
                <input
                  type="text"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-lg"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !githubLink.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    Generate README
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-red-200 font-medium">{error}</div>
              </div>
            )}

            {/* Results Section */}
            {readmeContent && (
              <div className="mt-8 space-y-6 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-bold text-white">Generated README</h2>
                  </div>
                  <div className="text-sm text-purple-200">
                    {readmeContent.length} characters
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={readmeContent}
                    readOnly
                    rows={16}
                    className="w-full bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none resize-none"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={handleCopy}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-purple-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download README.md
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-purple-200/70 text-sm">
              Create professional documentation in seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}