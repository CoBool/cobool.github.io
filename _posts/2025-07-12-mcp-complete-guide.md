---
title: "MCP (Model Context Protocol) 완전 정복: TypeScript로 시작하는 AI 에이전트 개발"
description: >-
  Anthropic의 혁신적인 Model Context Protocol(MCP)을 완전 정복하세요. 
  TypeScript 기반 구현부터 Context7 활용까지, AI 에이전트 개발의 새로운 표준을 알아봅니다.
date: 2025-07-12 10:00:00 +0900
categories: [AI 개발, MCP]
tags: [mcp, typescript, anthropic, context7, ai-agent, model-context-protocol]
pin: false
math: false
mermaid: false
---

## 들어가며

AI 개발자라면 누구나 한 번쯤 겪어봤을 상황입니다. 
"이 AI 에이전트가 내 데이터베이스에 접근할 수 있다면...", "외부 API와 연동할 수 있다면...", "실시간으로 최신 정보를 가져올 수 있다면..."

지금까지는 각각의 AI 애플리케이션마다 커스텀 통합을 구축해야 했습니다. 
N개의 AI 클라이언트와 M개의 외부 시스템을 연결하려면 N×M개의 통합이 필요했죠. 
이것이 바로 **"N×M 문제"**입니다.

> Anthropic에서 개발한 **Model Context Protocol(MCP)**이 이 모든 문제를 해결합니다.
{: .prompt-info }

## MCP란 무엇인가?

**Model Context Protocol(MCP)**는 AI 시스템과 외부 데이터 소스 및 도구를 연결하는 **오픈 표준**입니다. 
마치 웹 개발에서 API가 표준화를 가져왔듯이, MCP는 AI 개발에 표준화를 가져옵니다.

### 🎯 MCP의 핵심 개념

MCP는 세 가지 기본 요소로 구성됩니다:

1. **Tools (도구)** - POST 엔드포인트와 같은 역할, 실행 가능한 기능
2. **Resources (리소스)** - GET 엔드포인트와 같은 역할, 데이터 제공
3. **Prompts (프롬프트)** - 재사용 가능한 템플릿

### 🏗️ 아키텍처

```
┌─────────────────┐    JSON-RPC 2.0    ┌─────────────────┐
│   MCP Client    │ ←──────────────────→ │   MCP Server    │
│  (AI 애플리케이션) │                    │  (외부 시스템)    │
└─────────────────┘                    └─────────────────┘
```

## TypeScript로 MCP 서버 구현하기

이제 실제로 TypeScript를 사용해서 MCP 서버를 만들어보겠습니다!

### 📦 설치 및 설정

먼저 필요한 패키지를 설치합니다:

```bash
npm install @modelcontextprotocol/sdk
npm install -D typescript tsx @types/node
```

### 🚀 기본 MCP 서버 생성

간단한 "Hello World" 서버부터 시작해보겠습니다:

```typescript
// server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// MCP 서버 생성
const server = new McpServer({
  name: "my-first-mcp-server",
  version: "1.0.0"
});

// Hello World 도구 추가
server.registerTool(
  "hello",
  {
    title: "인사하기",
    description: "사용자에게 인사를 건넵니다",
    inputSchema: {
      name: z.string().describe("인사할 사람의 이름")
    }
  },
  async ({ name }) => ({
    content: [{
      type: "text",
      text: `안녕하세요, ${name}님! 👋`
    }]
  })
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP 서버가 시작되었습니다!");
}

main().catch(console.error);
```

### 🧮 실용적인 계산기 도구 구현

더 실용적인 예제로 계산기를 만들어보겠습니다:

```typescript
// calculator-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "calculator-server",
  version: "1.0.0"
});

// 계산기 도구 등록
server.registerTool(
  "calculate",
  {
    title: "계산기",
    description: "기본 사칙연산을 수행합니다",
    inputSchema: {
      operation: z.enum(["add", "subtract", "multiply", "divide"])
        .describe("수행할 연산"),
      a: z.number().describe("첫 번째 숫자"),
      b: z.number().describe("두 번째 숫자")
    }
  },
  async ({ operation, a, b }) => {
    let result: number;
    
    switch (operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) {
          return {
            content: [{
              type: "text",
              text: "❌ 0으로 나눌 수 없습니다!"
            }],
            isError: true
          };
        }
        result = a / b;
        break;
    }
    
    return {
      content: [{
        type: "text",
        text: `${a} ${operation} ${b} = ${result}`
      }]
    };
  }
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("계산기 MCP 서버가 시작되었습니다!");
}

main().catch(console.error);
```

### 📄 리소스 노출하기

이제 데이터를 제공하는 리소스를 만들어보겠습니다:

```typescript
// resource-server.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "resource-server",
  version: "1.0.0"
});

// 정적 리소스 등록
server.registerResource(
  "config",
  "config://app",
  {
    title: "애플리케이션 설정",
    description: "현재 애플리케이션의 설정 정보",
    mimeType: "application/json"
  },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: JSON.stringify({
        name: "My MCP App",
        version: "1.0.0",
        environment: "development",
        features: ["calculator", "greetings"]
      }, null, 2)
    }]
  })
);

// 동적 리소스 등록 (사용자 프로필)
server.registerResource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  {
    title: "사용자 프로필",
    description: "특정 사용자의 프로필 정보"
  },
  async (uri, { userId }) => {
    // 실제로는 데이터베이스에서 조회
    const mockUserData = {
      id: userId,
      name: `사용자 ${userId}`,
      email: `user${userId}@example.com`,
      createdAt: new Date().toISOString()
    };
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(mockUserData, null, 2)
      }]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("리소스 MCP 서버가 시작되었습니다!");
}

main().catch(console.error);
```

### 🔌 MCP 클라이언트 구현

이제 우리가 만든 서버와 통신할 클라이언트를 만들어보겠습니다:

```typescript
// client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 서버 연결
  const transport = new StdioClientTransport({
    command: "tsx",
    args: ["server.ts"]
  });
  
  const client = new Client({
    name: "mcp-client",
    version: "1.0.0"
  });
  
  await client.connect(transport);
  
  // 사용 가능한 도구 목록 조회
  const tools = await client.listTools();
  console.log("사용 가능한 도구:", tools.tools);
  
  // 계산기 도구 호출
  const result = await client.callTool({
    name: "calculate",
    arguments: {
      operation: "add",
      a: 10,
      b: 5
    }
  });
  
  console.log("계산 결과:", result.content[0]);
  
  // 리소스 읽기
  const resources = await client.listResources();
  console.log("사용 가능한 리소스:", resources.resources);
  
  const config = await client.readResource({
    uri: "config://app"
  });
  
  console.log("설정 정보:", config.contents[0]);
  
  // 연결 종료
  await client.close();
}

main().catch(console.error);
```

## 🌟 Context7: 가장 추천하는 MCP 서버

이제 **Context7**에 대해 알아보겠습니다. Context7은 Upstash에서 개발한 혁신적인 MCP 서버로, 
**실시간으로 최신 문서를 가져와서 AI의 컨텍스트에 주입**하는 놀라운 기능을 제공합니다.

### 🤔 기존 방식의 문제점

```typescript
// ❌ 기존 방식: 오래된 정보로 인한 문제
const prompt = `
Next.js 14에서 App Router를 사용해서 
동적 라우팅을 구현하는 방법을 알려줘
`;
// 결과: 오래된 문서 기반으로 잘못된 정보 제공
```

### ✅ Context7과 함께하는 새로운 방식

```typescript
// ✅ Context7 사용: 최신 정보 기반 정확한 답변
const prompt = `
Next.js 14에서 App Router를 사용해서 
동적 라우팅을 구현하는 방법을 알려줘
use context7
`;
// 결과: 최신 Next.js 14 공식 문서 기반 정확한 정보 제공
```

### 🚀 Context7 설치하기

#### 1. Cursor에서 설치

`~/.cursor/mcp.json` 파일에 다음 설정을 추가하세요:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

#### 2. VS Code에서 설치

VS Code의 `settings.json`에 다음을 추가하세요:

```json
{
  "mcp.servers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

#### 3. Windsurf에서 설치

Windsurf MCP 설정 파일에 다음을 추가하세요:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### 🎯 Context7 활용 예제

Context7의 강력함을 보여주는 실제 예제들입니다:

```typescript
// 1. React 최신 기능 질문
const prompt1 = `
React 18의 Concurrent Features를 사용해서
사용자 경험을 개선하는 방법을 알려줘
use context7
`;

// 2. 데이터베이스 연결 질문
const prompt2 = `
Prisma ORM을 사용해서 PostgreSQL에 연결하고
마이그레이션을 설정하는 방법을 보여줘
use context7
`;

// 3. 최신 라이브러리 사용법
const prompt3 = `
Tailwind CSS의 최신 유틸리티 클래스를 사용해서
반응형 디자인을 구현하는 방법을 알려줘
use context7
`;
```

### 🛠️ Context7의 주요 도구들

Context7은 두 가지 핵심 도구를 제공합니다:

1. **`resolve-library-id`**: 라이브러리 이름을 Context7 호환 ID로 변환
2. **`get-library-docs`**: 실제 문서와 코드 예제를 가져옴

```typescript
// Context7 도구 사용 예제
const libraryId = await resolveLibraryId("nextjs");
const docs = await getLibraryDocs({
  libraryId: "/vercel/next.js",
  topic: "app-router",
  tokens: 5000
});
```

## 💡 실무 프로젝트: 메모 관리 시스템

이제 배운 내용을 활용해서 완전한 메모 관리 시스템을 만들어보겠습니다!

### 📝 메모 관리 MCP 서버

```typescript
// memo-server.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

interface Memo {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

class MemoStorage {
  private memos: Map<string, Memo> = new Map();
  
  create(memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>): Memo {
    const id = Date.now().toString();
    const now = new Date();
    const newMemo: Memo = {
      ...memo,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.memos.set(id, newMemo);
    return newMemo;
  }
  
  findAll(): Memo[] {
    return Array.from(this.memos.values());
  }
  
  findById(id: string): Memo | undefined {
    return this.memos.get(id);
  }
  
  update(id: string, updates: Partial<Memo>): Memo | null {
    const memo = this.memos.get(id);
    if (!memo) return null;
    
    const updated = { ...memo, ...updates, updatedAt: new Date() };
    this.memos.set(id, updated);
    return updated;
  }
  
  delete(id: string): boolean {
    return this.memos.delete(id);
  }
  
  search(query: string): Memo[] {
    const lowercaseQuery = query.toLowerCase();
    return this.findAll().filter(memo => 
      memo.title.toLowerCase().includes(lowercaseQuery) ||
      memo.content.toLowerCase().includes(lowercaseQuery) ||
      memo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

const storage = new MemoStorage();
const server = new McpServer({
  name: "memo-manager",
  version: "1.0.0"
});

// 메모 생성 도구
server.registerTool(
  "create-memo",
  {
    title: "메모 생성",
    description: "새로운 메모를 생성합니다",
    inputSchema: {
      title: z.string().describe("메모 제목"),
      content: z.string().describe("메모 내용"),
      tags: z.array(z.string()).optional().describe("태그 목록")
    }
  },
  async ({ title, content, tags = [] }) => {
    const memo = storage.create({ title, content, tags });
    return {
      content: [{
        type: "text",
        text: `✅ 메모가 생성되었습니다!\n\nID: ${memo.id}\n제목: ${memo.title}\n태그: ${memo.tags.join(", ")}`
      }]
    };
  }
);

// 메모 검색 도구
server.registerTool(
  "search-memos",
  {
    title: "메모 검색",
    description: "제목, 내용, 태그로 메모를 검색합니다",
    inputSchema: {
      query: z.string().describe("검색 쿼리")
    }
  },
  async ({ query }) => {
    const results = storage.search(query);
    
    if (results.length === 0) {
      return {
        content: [{
          type: "text",
          text: `🔍 "${query}"에 대한 검색 결과가 없습니다.`
        }]
      };
    }
    
    const resultText = results.map(memo => 
      `📝 ${memo.title} (ID: ${memo.id})\n` +
      `${memo.content.substring(0, 100)}${memo.content.length > 100 ? '...' : ''}\n` +
      `태그: ${memo.tags.join(", ")}\n`
    ).join("\n");
    
    return {
      content: [{
        type: "text",
        text: `🔍 "${query}" 검색 결과 (${results.length}개):\n\n${resultText}`
      }]
    };
  }
);

// 메모 삭제 도구
server.registerTool(
  "delete-memo",
  {
    title: "메모 삭제",
    description: "메모를 삭제합니다",
    inputSchema: {
      id: z.string().describe("삭제할 메모 ID")
    }
  },
  async ({ id }) => {
    const deleted = storage.delete(id);
    
    if (!deleted) {
      return {
        content: [{
          type: "text",
          text: `❌ ID ${id}인 메모를 찾을 수 없습니다.`
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: "text",
        text: `🗑️ 메모 ID ${id}가 삭제되었습니다.`
      }]
    };
  }
);

// 메모 목록 리소스
server.registerResource(
  "memo-list",
  "memos://list",
  {
    title: "메모 목록",
    description: "모든 메모의 목록을 제공합니다",
    mimeType: "application/json"
  },
  async (uri) => {
    const memos = storage.findAll();
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(memos, null, 2)
      }]
    };
  }
);

// 개별 메모 리소스
server.registerResource(
  "memo-detail",
  new ResourceTemplate("memos://{id}", { list: undefined }),
  {
    title: "메모 상세",
    description: "특정 메모의 상세 정보"
  },
  async (uri, { id }) => {
    const memo = storage.findById(id);
    
    if (!memo) {
      throw new Error(`메모 ID ${id}를 찾을 수 없습니다.`);
    }
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(memo, null, 2)
      }]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("📝 메모 관리 MCP 서버가 시작되었습니다!");
}

main().catch(console.error);
```

### 🧪 메모 시스템 테스트

```typescript
// memo-client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function testMemoSystem() {
  const transport = new StdioClientTransport({
    command: "tsx",
    args: ["memo-server.ts"]
  });
  
  const client = new Client({
    name: "memo-client",
    version: "1.0.0"
  });
  
  await client.connect(transport);
  
  console.log("🧪 메모 시스템 테스트 시작!\n");
  
  // 1. 메모 생성
  console.log("1. 메모 생성 테스트");
  const createResult = await client.callTool({
    name: "create-memo",
    arguments: {
      title: "MCP 학습 노트",
      content: "Model Context Protocol은 AI 에이전트와 외부 시스템을 연결하는 표준 프로토콜이다.",
      tags: ["AI", "MCP", "개발"]
    }
  });
  console.log(createResult.content[0]);
  
  // 2. 메모 검색
  console.log("\n2. 메모 검색 테스트");
  const searchResult = await client.callTool({
    name: "search-memos",
    arguments: {
      query: "MCP"
    }
  });
  console.log(searchResult.content[0]);
  
  // 3. 메모 목록 조회
  console.log("\n3. 메모 목록 조회 테스트");
  const listResource = await client.readResource({
    uri: "memos://list"
  });
  console.log("📋 메모 목록:", JSON.parse(listResource.contents[0].text));
  
  await client.close();
  console.log("\n✅ 테스트 완료!");
}

testMemoSystem().catch(console.error);
```

## 🔧 실무 팁과 베스트 프랙티스

### 1. 에러 처리

```typescript
// 견고한 에러 처리 예제
server.registerTool(
  "safe-operation",
  {
    title: "안전한 작업",
    description: "에러 처리가 포함된 안전한 작업",
    inputSchema: {
      data: z.string()
    }
  },
  async ({ data }) => {
    try {
      // 위험한 작업 수행
      const result = await performRiskyOperation(data);
      
      return {
        content: [{
          type: "text",
          text: `✅ 작업 성공: ${result}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `❌ 작업 실패: ${error.message}`
        }],
        isError: true
      };
    }
  }
);
```

### 2. 입력 검증

```typescript
// Zod를 활용한 강력한 입력 검증
const EmailSchema = z.string().email("유효한 이메일 주소를 입력하세요");
const PasswordSchema = z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다");

server.registerTool(
  "create-user",
  {
    title: "사용자 생성",
    description: "새로운 사용자를 생성합니다",
    inputSchema: {
      email: EmailSchema,
      password: PasswordSchema,
      age: z.number().min(0).max(120)
    }
  },
  async ({ email, password, age }) => {
    // 검증된 데이터로 안전하게 작업
    // ...
  }
);
```

### 3. 성능 최적화

```typescript
// 캐싱을 활용한 성능 최적화
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

server.registerTool(
  "cached-operation",
  {
    title: "캐시된 작업",
    description: "결과를 캐시하는 효율적인 작업",
    inputSchema: {
      key: z.string()
    }
  },
  async ({ key }) => {
    const cached = cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return {
        content: [{
          type: "text",
          text: `🚀 캐시된 결과: ${cached.data}`
        }]
      };
    }
    
    // 실제 작업 수행
    const result = await performExpensiveOperation(key);
    cache.set(key, { data: result, timestamp: now });
    
    return {
      content: [{
        type: "text",
        text: `💾 새로운 결과: ${result}`
      }]
    };
  }
);
```

## 🚀 배포 및 운영

### Docker를 활용한 배포

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 환경 변수 관리

```typescript
// config.ts
export const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL || 'sqlite:memory:',
  logLevel: process.env.LOG_LEVEL || 'info',
  apiKey: process.env.API_KEY || ''
};
```

## 🔮 MCP의 미래

MCP는 AI 개발의 미래를 바꿀 혁신적인 기술입니다:

### 🌟 예상되는 발전 방향

1. **더 많은 클라이언트 지원**
   - VS Code, IntelliJ, Vim 등 더 많은 에디터
   - 웹 브라우저 기반 AI 도구들

2. **표준화 확산**
   - 더 많은 AI 모델 제공업체 지원
   - 기업용 솔루션 확산

3. **고급 기능**
   - 실시간 협업 기능
   - 고급 보안 및 권한 관리
   - 성능 모니터링 및 분석

### 💡 개발자를 위한 조언

1. **지금 시작하세요**: MCP는 아직 초기 단계입니다. 지금 시작하면 선두주자가 될 수 있습니다.

2. **커뮤니티 참여**: [MCP 공식 GitHub](https://github.com/modelcontextprotocol)에서 활발히 활동하세요.

3. **실험과 학습**: 다양한 MCP 서버를 만들어보면서 경험을 쌓으세요.

4. **Context7 활용**: 당장 실무에서 사용할 수 있는 강력한 도구입니다.

## 마무리

Model Context Protocol은 AI 개발의 패러다임을 바꾸는 혁신적인 기술입니다. 
**N×M 문제를 해결**하고, **표준화된 인터페이스**를 제공하며, **Context7**과 같은 강력한 도구들을 통해 
즉시 실무에 적용할 수 있습니다.

TypeScript로 MCP 서버를 구축하는 것은 생각보다 간단합니다. 
오늘 배운 내용을 바탕으로 여러분만의 MCP 서버를 만들어보세요!

> **"use context7"** 한 줄로 AI의 정확도를 10배 향상시킬 수 있습니다. 
> 지금 바로 시작해보세요! 🚀
{: .prompt-tip }

### 🔗 유용한 링크

- [MCP 공식 사이트](https://modelcontextprotocol.io/)
- [Context7 GitHub](https://github.com/upstash/context7)
- [TypeScript SDK 문서](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP 커뮤니티](https://discord.gg/modelcontextprotocol)

---

> 이 포스트가 도움이 되셨다면, 여러분의 MCP 서버 개발 경험을 댓글로 공유해주세요! 
> 함께 AI 개발의 미래를 만들어가요. 💪 