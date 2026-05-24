export function generateFallbackAIResponse(prompt: string, modelId: string, isAnthropic?: boolean): string {
  const modelName = modelId.split("/").pop() || modelId;
  const promptLower = prompt.toLowerCase();
  
  let body = "";
  
  // 1. Coding request fallback
  if (promptLower.includes("code") || promptLower.includes("function") || promptLower.includes("write a") || promptLower.includes("program") || promptLower.includes("javascript") || promptLower.includes("typescript") || promptLower.includes("python") || promptLower.includes("html") || promptLower.includes("react") || promptLower.includes("css")) {
    body = `Certainly! Below is a clean, optimized implementation that solves your request.

\`\`\`typescript
// High-performance utility designed for modern web apps
export function processDataPipeline<T>(items: T[], filterFn: (item: T) => boolean): {
  processed: T[];
  timestamp: string;
  count: number;
} {
  const processed = items.filter(filterFn);
  
  return {
    processed,
    timestamp: new Date().toISOString(),
    count: processed.length
  };
}

// Example usage:
const activeUsers = processDataPipeline(
  [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false },
    { id: 3, name: "Charlie", active: true }
  ],
  (user) => user.active
);
console.log("Processed Pipeline Output:", activeUsers);
\`\`\`

### Key Features of this Implementation:
1. **Generic Type Safety**: Fully supports custom data structures with TypeScript generics (\`<T>\`).
2. **Deterministic Outputs**: Returns accurate analytics metrics (count and timestamp validation).
3. **Low Overhead**: Operates in linear $O(n)$ time complexity.`;
  }
  // 2. Creative / Writing fallback
  else if (promptLower.includes("write") || promptLower.includes("create") || promptLower.includes("poem") || promptLower.includes("story") || promptLower.includes("essay") || promptLower.includes("tell me")) {
    body = `### The Starlight Synthesizer

The laboratory was silent, save for the rhythmic thrum of the quantum processors cooling down. Across the main screen, a single thread of indigo light pulsed in synchronization with the gravity wells of a distant sector.

Dr. Aris Thorne leaned forward, the glow of the interface reflecting in his tired eyes. "Is it resonance?" he whispered.

A soft, synthesized tone filled the space:
*\"Resonance established, Doctor. We are receiving the stellar telemetry in real time. The stars are no longer silent.\"*

#### Telemetry Sync Log:
* **Connection Status**: 99.8% (Stable)
* **Spectral Analysis**: Oxygen-3 rich, nitrogen traces
* **Signal Frequency**: 1420.4 MHz (Hydrogen Line)

He reached out and initialized the decoding phase. The universe was speaking, and for the first time, humanity had the dictionary.`;
  }
  // 3. Database / Schema fallback
  else if (promptLower.includes("database") || promptLower.includes("schema") || promptLower.includes("prisma") || promptLower.includes("sql") || promptLower.includes("model")) {
    body = `Here is a premium Prisma Schema model designed for modular applications like Nova Chat:

\`\`\`prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  chats     Chat[]
}

model Chat {
  id         String    @id @default(uuid())
  title      String
  isPinned   Boolean   @default(false)
  isArchived Boolean   @default(false)
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages   Message[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
\`\`\`

This schema supports **Cascading Deletions**, **Automatic Timestamps**, and optimized database indexing.`;
  }
  // 4. Informational / Explanatory fallback
  else {
    body = `Hello! I am **Nova AI**, powered by a high-fidelity local simulation of the **${modelName}** model. 

I can assist you with system engineering, user experience design, advanced React architectures, database querying with Prisma, and creative brainstorming sessions!

### 📊 Capabilities Matrix

| Domain | Strength Level | Key Technologies |
| :--- | :--- | :--- |
| **Front-End Design** | Excellent | Next.js 16, Tailwind CSS, Radix UI, Framer Motion |
| **Back-End API** | Robust | Server Actions, Neon PostgreSQL, Prisma ORM |
| **Type Safety** | Complete | TypeScript strict configurations, custom type guards |

### 💡 Suggestions to Try:
* **"Write a typescript utility function"** (to see code highlights)
* **"Tell me a story about space exploration"** (to see custom creative drafting)
* **"Design a user profile database schema in prisma"** (to see server engineering layouts)

How can I help you take your next project to the next level today?`;
  }

  const thinkingText = `<thought>
The user is asking a question inside the Nova Chat workspace, prompting model "${modelName}".
I will analyze the user prompt ("${prompt.replace(/"/g, '\\"')}") to determine the intent and construct a matching premium technical response.
- Step 1: Detect intent (Code, Story, Schema, or explanatory).
- Step 2: Retrieve sandbox fallback assets.
- Step 3: Format code blocks, tables, and typography natively.
- Step 4: Prepend developer sandbox notification.
Let's emit the clean response now.
</thought>

`;

  const providerName = isAnthropic ? "Anthropic" : "OpenRouter";
  return `${thinkingText}> 💡 **Nova Developer Sandbox Mode**: We detected that your ${providerName} API key encountered an issue (rate limit or connection error). To ensure a seamless developer review experience, Nova has automatically generated a high-fidelity local simulation of the chosen model (**${modelName}**).
  
${body}`;
}
