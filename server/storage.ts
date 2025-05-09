import { problems, type HomeworkProblem, type InsertProblem, users, type User, type InsertUser } from "@shared/schema";
import { Step } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Problem operations
  createProblem(problem: InsertProblem): Promise<HomeworkProblem>;
  getProblemById(id: number): Promise<HomeworkProblem | undefined>;
  updateProblemText(id: number, text: string): Promise<HomeworkProblem>;
  updateProblemAnalysis(id: number, analysis: {
    problemType: string;
    overview: string;
    steps: Step[];
    detailedExplanation: string;
    solution: string;
  }): Promise<HomeworkProblem>;
  getAllProblems(): Promise<HomeworkProblem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private problems: Map<number, HomeworkProblem>;
  private userIdCounter: number;
  private problemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.problems = new Map();
    this.userIdCounter = 1;
    this.problemIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Problem operations
  async createProblem(problem: InsertProblem): Promise<HomeworkProblem> {
    const id = this.problemIdCounter++;
    const newProblem: HomeworkProblem = { 
      ...problem, 
      id,
      createdAt: new Date()
    };
    
    this.problems.set(id, newProblem);
    return newProblem;
  }
  
  async getProblemById(id: number): Promise<HomeworkProblem | undefined> {
    return this.problems.get(id);
  }
  
  async updateProblemText(id: number, text: string): Promise<HomeworkProblem> {
    const problem = this.problems.get(id);
    
    if (!problem) {
      throw new Error(`Problem with ID ${id} not found`);
    }
    
    const updatedProblem: HomeworkProblem = {
      ...problem,
      detectedText: text
    };
    
    this.problems.set(id, updatedProblem);
    return updatedProblem;
  }
  
  async updateProblemAnalysis(id: number, analysis: {
    problemType: string;
    overview: string;
    steps: Step[];
    detailedExplanation: string;
    solution: string;
  }): Promise<HomeworkProblem> {
    const problem = this.problems.get(id);
    
    if (!problem) {
      throw new Error(`Problem with ID ${id} not found`);
    }
    
    const updatedProblem: HomeworkProblem = {
      ...problem,
      ...analysis
    };
    
    this.problems.set(id, updatedProblem);
    return updatedProblem;
  }
  
  async getAllProblems(): Promise<HomeworkProblem[]> {
    return Array.from(this.problems.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
