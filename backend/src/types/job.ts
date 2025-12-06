export type JobDescription = {
  title?: string;
  company?: string;
  location?: string;
  text: string;
  selectors?: { jdSelector?: string; applyButtonSelector?: string };
};

export type FormField = {
  name: string;
  selector: string;
  type: string;
  maxLength?: number;
  required?: boolean;
};
