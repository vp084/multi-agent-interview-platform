// GitHub Repository Fetcher & Manifest Inspector

/**
 * Extracts owner and repo from various GitHub URL formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/tree/main/...
 * - github.com/owner/repo
 */
export const parseGitHubUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const clean = url.trim().replace(/\.git$/i, "");
    const match = clean.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (!match) return null;
    return {
        owner: match[1],
        repo: match[2],
    };
};

const GITHUB_HEADERS = {
    "User-Agent": "ApexPath-Resume-Analyzer",
    "Accept": "application/vnd.github.v3+json",
};

// Common dev packages to omit to prevent ATS noise
const NOISY_PACKAGES = new Set([
    "eslint", "prettier", "nodemon", "rimraf", "concurrently", 
    "cross-env", "dotenv", "ts-node", "babel", "@types/node", 
    "chokidar", "webpack-dev-server"
]);

/**
 * Safely fetches JSON from GitHub API
 */
const fetchGitHubJson = async (endpoint) => {
    try {
        const res = await fetch(`https://api.github.com${endpoint}`, {
            headers: GITHUB_HEADERS,
        });
        if (!res.ok) {
            if (res.status === 404) return null;
            if (res.status === 403) {
                console.warn("GitHub API rate limit exceeded or access forbidden");
                return null;
            }
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error(`Error fetching GitHub endpoint ${endpoint}:`, err.message);
        return null;
    }
};

/**
 * Fetches and decodes a file from GitHub repository
 */
const fetchRepoFileContent = async (owner, repo, path) => {
    const data = await fetchGitHubJson(`/repos/${owner}/${repo}/contents/${path}`);
    if (!data || !data.content) return null;
    try {
        const decoded = Buffer.from(data.content, "base64").toString("utf-8");
        return decoded;
    } catch {
        return null;
    }
};

/**
 * Ingests repository metadata, dependency manifests, and architectural breadcrumbs.
 */
export const fetchRepositoryContext = async (repoUrl) => {
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
        throw new Error("Invalid GitHub repository URL. Format should be: https://github.com/owner/repo");
    }

    const { owner, repo } = parsed;

    // 1. Fetch Basic Repo Info
    const repoInfo = await fetchGitHubJson(`/repos/${owner}/${repo}`);
    if (!repoInfo) {
        throw new Error(`Could not access repository "${owner}/${repo}". Please make sure it is public and exists.`);
    }

    const projectData = {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        description: repoInfo.description || "",
        stars: repoInfo.stargazers_count || 0,
        forks: repoInfo.forks_count || 0,
        language: repoInfo.language || "Unknown",
        topics: repoInfo.topics || [],
        htmlUrl: repoInfo.html_url,
        createdAt: repoInfo.created_at,
        updatedAt: repoInfo.updated_at,
        dependencies: [],
        architectureBreadcrumbs: [],
        readmeSummary: "",
    };

    // 2. Fetch Directory Contents to detect infrastructure / architecture
    const rootContents = await fetchGitHubJson(`/repos/${owner}/${repo}/contents`);
    const subfolderNames = [];
    if (Array.isArray(rootContents)) {
        const names = rootContents.map((item) => item.name.toLowerCase());
        
        if (names.includes("dockerfile")) projectData.architectureBreadcrumbs.push("Docker Containerization");
        if (names.includes("docker-compose.yml") || names.includes("docker-compose.yaml")) {
            projectData.architectureBreadcrumbs.push("Docker Compose Multi-Container");
        }
        if (names.includes(".github")) projectData.architectureBreadcrumbs.push("CI/CD Workflows (GitHub Actions)");
        if (names.includes("prisma")) projectData.architectureBreadcrumbs.push("Prisma ORM");
        if (names.includes("migrations")) projectData.architectureBreadcrumbs.push("Database Migrations");
        if (names.includes("tests") || names.includes("__tests__") || names.includes("test")) {
            projectData.architectureBreadcrumbs.push("Automated Test Suites");
        }
        if (names.includes("kubernetes") || names.includes("k8s")) {
            projectData.architectureBreadcrumbs.push("Kubernetes Orchestration");
        }

        // Detect monorepo subfolders (e.g. frontend, backend, client, server, api)
        rootContents.forEach((item) => {
            if (item.type === "dir" && ["client", "server", "frontend", "backend", "api", "web", "app", "services"].includes(item.name.toLowerCase())) {
                subfolderNames.push(item.name);
            }
        });
    }

    projectData.domainModels = [];
    projectData.recentCommits = [];

    // 3. Inspect Dependencies across Root and Monorepo Subfolders
    const searchPaths = ["", ...subfolderNames.map((folder) => `${folder}/`)];

    for (const prefix of searchPaths) {
        // Node / JS / TS (package.json)
        const packageJsonRaw = await fetchRepoFileContent(owner, repo, `${prefix}package.json`);
        if (packageJsonRaw) {
            try {
                const pkg = JSON.parse(packageJsonRaw);
                const directDeps = Object.keys(pkg.dependencies || {});
                const devDeps = Object.keys(pkg.devDependencies || {}).filter(
                    (d) => !NOISY_PACKAGES.has(d.toLowerCase())
                );
                projectData.dependencies.push(...directDeps, ...devDeps);
                if (pkg.description && !projectData.description) {
                    projectData.description = pkg.description;
                }
            } catch (e) {
                console.warn(`Failed to parse ${prefix}package.json:`, e.message);
            }
        }

        // Python (requirements.txt)
        const requirementsTxt = await fetchRepoFileContent(owner, repo, `${prefix}requirements.txt`);
        if (requirementsTxt) {
            const pyDeps = requirementsTxt
                .split("\n")
                .map((line) => line.split(/[==|>=|<=|<|>|~=]/)[0].trim())
                .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"));
            projectData.dependencies.push(...pyDeps);
        }

        // Go (go.mod)
        const goMod = await fetchRepoFileContent(owner, repo, `${prefix}go.mod`);
        if (goMod) {
            const goDeps = [];
            const lines = goMod.split("\n");
            let inRequire = false;
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("require (")) {
                    inRequire = true;
                    continue;
                }
                if (inRequire && trimmed === ")") {
                    inRequire = false;
                    continue;
                }
                if (inRequire && trimmed) {
                    const pkg = trimmed.split(" ")[0];
                    if (pkg) goDeps.push(pkg.split("/").pop());
                } else if (trimmed.startsWith("require ")) {
                    const parts = trimmed.split(" ");
                    if (parts[1]) goDeps.push(parts[1].split("/").pop());
                }
            }
            projectData.dependencies.push(...goDeps);
        }

        // Prisma Schema (Domain Model Extraction)
        const prismaSchema = await fetchRepoFileContent(owner, repo, `${prefix}prisma/schema.prisma`) ||
                             await fetchRepoFileContent(owner, repo, `${prefix}schema.prisma`);
        if (prismaSchema) {
            projectData.architectureBreadcrumbs.push("Prisma ORM Schema");
            const modelMatches = [...prismaSchema.matchAll(/model\s+([A-Za-z0-9_]+)\s*\{/g)];
            const models = modelMatches.map((m) => m[1]);
            if (models.length > 0) {
                projectData.domainModels.push(...models);
            }
        }
    }

    // 4. Fetch Recent Meaningful Commit Messages
    try {
        const commits = await fetchGitHubJson(`/repos/${owner}/${repo}/commits?per_page=12`);
        if (Array.isArray(commits)) {
            projectData.recentCommits = commits
                .map((c) => c.commit?.message?.split("\n")[0]?.trim())
                .filter((msg) => msg && !msg.startsWith("Merge ") && msg.length > 8)
                .slice(0, 6);
        }
    } catch (e) {
        console.warn("Could not fetch commits:", e.message);
    }

    // D. Cargo (Rust)
    const cargoToml = await fetchRepoFileContent(owner, repo, "Cargo.toml");


    if (cargoToml) {
        const rustDeps = [];
        const lines = cargoToml.split("\n");
        let inDeps = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("[dependencies]")) {
                inDeps = true;
                continue;
            }
            if (inDeps && trimmed.startsWith("[")) {
                inDeps = false;
                continue;
            }
            if (inDeps && trimmed && !trimmed.startsWith("#")) {
                const depName = trimmed.split("=")[0].trim();
                if (depName) rustDeps.push(depName);
            }
        }
        projectData.dependencies.push(...rustDeps);
    }

    // 4. Fetch README
    const readmeRaw = await fetchRepoFileContent(owner, repo, "README.md") || 
                      await fetchRepoFileContent(owner, repo, "readme.md");
    if (readmeRaw) {
        // Truncate to first 3000 chars to avoid prompt token explosion
        projectData.readmeSummary = readmeRaw.slice(0, 3000).trim();
    }

    // Clean and de-duplicate dependencies
    projectData.dependencies = Array.from(new Set(projectData.dependencies)).slice(0, 30);

    return projectData;
};
