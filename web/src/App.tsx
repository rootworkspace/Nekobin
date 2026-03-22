import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Flame, Clipboard, Check, Plus, Hash } from "lucide-react";

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [isBurn, setIsBurn] = useState(false);
  const [pasteId, setPasteId] = useState("");
  const [viewId, setViewId] = useState("");
  const [viewContent, setViewContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    /* Change the view instead of having to reload the page */
    const syncHash = () => {
      const hash = window.location.hash.replace("#", "");
      setViewId(hash);
      if (hash) {
        fetchPaste(hash);
      } else {
        setViewContent("");
        setIsNotFound(false);
      }
      setIsInitialLoading(false);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (window.location.hash !== "") {
      document.title = `Nekobin | ${window.location.hash}`;
    } else {
      document.title = "Nekobin | Create Paste";
    }
  }, [window.location.hash]);

  const handleCreate = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (isBurn) params.append("is_burn", "true");
      if (password) params.append("pw", password);

      const url = `/p/?${params.toString()}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      setPasteId(data.id);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaste = async (id: string) => {
    setLoading(true);
    setIsNotFound(false);
    try {
      const url = `/p/${id}${password ? `?password=${password}` : ""}`;
      const res = await fetch(url);

      if (res.status === 404) {
        setIsNotFound(true);
        return;
      }
      if (res.status === 401) {
        // Password prompt by default
        return;
      }
      if (!res.ok) throw new Error("Fetch failed");

      const text = await res.json();
      setViewContent(text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setPasteId("");
    setViewId("");
    setViewContent("");
    setContent("");
    setPassword("");
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-primary/30 selection:text-primary p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Hash className="text-primary-foreground h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">nekobin</h1>
          </div>
          {viewId && (
            <Button variant="outline" size="sm" onClick={reset} className="border-zinc-800 hover:bg-zinc-900">
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          )}
        </header>

        {/* Create paste page */}
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-zinc-500 font-mono animate-pulse">Loading paste...</div>
          </div>
        ) : !viewId ? (
          <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Create Paste</CardTitle>
              <CardDescription>Share code or text instantly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Drop your logs, code, or secrets here..."
                className="min-h-[400px] bg-zinc-950/50 border-zinc-800 font-mono focus-visible:ring-primary"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md">
                    <Lock className="h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="password"
                      placeholder="Optional Password"
                      className="bg-transparent border-none text-sm focus:outline-none w-32"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="burn-mode" checked={isBurn} onCheckedChange={setIsBurn} />
                    <Label htmlFor="burn-mode" className="text-sm text-zinc-400 flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-orange-500" /> Burn on Read
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={!content || loading}
                  className="w-full md:w-auto px-8"
                >
                  {loading ? "Uploading..." : "Save Paste"}
                </Button>
              </div>

              {pasteId && (
                <div className="animate-in fade-in slide-in-from-bottom-2 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-100 truncate mr-4">
                    {window.location.origin}/#{pasteId}
                  </p>
                  <Button size="sm" onClick={() => copyToClipboard(`${window.location.origin}/#${pasteId}`)} className="shrink-0">
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="space-y-4">


              {isNotFound ? (
                /* Not found page */
                <div className="max-w-sm mx-auto text-center space-y-6 py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <Hash className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-zinc-100">Paste Not Found</h3>
                    <p className="text-sm text-zinc-500">The paste you are looking for doesn't exist or has been burned.</p>
                  </div>
                  <Button onClick={reset} variant="outline" className="border-zinc-800 hover:bg-zinc-900">
                    Back to Home
                  </Button>
                </div>
              ) : !viewContent ? (
                /* Password protected page */
                <div className="max-w-sm mx-auto text-center space-y-6 py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Protected Paste</h3>
                    <p className="text-sm text-zinc-500">Enter the password to view the content.</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      className="bg-zinc-950 border-zinc-800"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchPaste(viewId)}
                    />
                    <Button onClick={() => fetchPaste(viewId)} disabled={loading}>
                      {loading ? "Checking..." : "Unlock"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Content page */
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Content</span>
                    <Button size="sm" onClick={() => copyToClipboard(viewContent)} className="h-8 px-3">
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <pre className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {viewContent}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;