
export interface TeamMember {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
      url: string;
    }
  }[];
}

export interface Team {
  id: string;
  name: string;
  members: (TeamMember | null)[];
}