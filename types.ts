
export enum TransactionType {
  INCOME = 'Entrada',
  EXPENSE = 'Saída'
}

export enum Category {
  INCOME = 'INCOME',
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  LEISURE = 'LEISURE',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  OTHERS = 'OTHERS'
}

export interface Transaction {
  id: string;
  category: Category;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AIAnalysisResult {
  text: string;
  sources?: GroundingChunk[];
}

export interface AppSettings {
  language: 'pt' | 'en' | 'es';
  theme: 'ruby' | 'classic' | 'forest';
  lightMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'sans' | 'serif' | 'inter';
}
