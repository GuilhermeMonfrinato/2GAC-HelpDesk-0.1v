import { Ticket, Department, Technician, Category, AccessibilitySettings, NotebookLoan } from '../types';
import { initialTickets, initialDepartments, initialTechnicians, initialCategories, initialNotebookLoans } from '../data/mockData';

const STORAGE_KEYS = {
  TICKETS: 'eb_tickets_v3',
  DEPARTMENTS: 'eb_departments_v3',
  TECHNICIANS: 'eb_technicians_v3',
  CATEGORIES: 'eb_categories_v3',
  NOTEBOOK_LOANS: 'eb_notebook_loans_v3',
  A11Y: 'eb_a11y_v3',
};

export const loadTickets = (): Ticket[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(initialTickets));
      return initialTickets;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler tickets do localStorage:', e);
    return initialTickets;
  }
};

export const saveTickets = (tickets: Ticket[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  } catch (e) {
    console.error('Erro ao salvar tickets:', e);
  }
};

export const loadDepartments = (): Department[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(initialDepartments));
      return initialDepartments;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialDepartments;
  }
};

export const saveDepartments = (depts: Department[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(depts));
  } catch (e) {
    console.error('Erro ao salvar seções:', e);
  }
};

export const loadTechnicians = (): Technician[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(initialTechnicians));
      return initialTechnicians;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialTechnicians;
  }
};

export const saveTechnicians = (techs: Technician[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(techs));
  } catch (e) {
    console.error('Erro ao salvar técnicos:', e);
  }
};

export const loadCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
      return initialCategories;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialCategories;
  }
};

export const saveCategories = (cats: Category[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  } catch (e) {
    console.error('Erro ao salvar categorias:', e);
  }
};

export const loadNotebookLoans = (): NotebookLoan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTEBOOK_LOANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTEBOOK_LOANS, JSON.stringify(initialNotebookLoans));
      return initialNotebookLoans;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialNotebookLoans;
  }
};

export const saveNotebookLoans = (loans: NotebookLoan[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTEBOOK_LOANS, JSON.stringify(loans));
  } catch (e) {
    console.error('Erro ao salvar cautelas de notebook:', e);
  }
};

export const loadAccessibilitySettings = (): AccessibilitySettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.A11Y);
    if (!raw) {
      return {
        fontSize: 'normal',
        highContrast: false,
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      fontSize: 'normal',
      highContrast: false,
    };
  }
};

export const saveAccessibilitySettings = (settings: AccessibilitySettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.A11Y, JSON.stringify(settings));
  } catch (e) {
    console.error('Erro ao salvar a11y:', e);
  }
};
