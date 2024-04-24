export type Trecipe = {
  _id: string;
  name: string;
  ingredients: {
    ingredient: string;
    amount: string;
  }[];
  time: number;
  directions: string[];
  dietaryTags: string[];
  summary: string;
  author: string;
  priority?: number;
  imageURL?: string;
};

export type Tuser = {
  id: string;
  name: string;
  password: string;
};

export type Tinput = {
  name: string;
  summary: string;
  ingredients: {
    ingredient: string;
    amount: string;
  }[];
  time: number;
  directions: string[];
  dietaryTags: string[];
  userId: string;
  imageURL?: string;
};
