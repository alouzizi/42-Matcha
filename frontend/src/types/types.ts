export type Profile = {
    id: number;
    username: string;
    name: string;
    age: number;
    distance: string;
    pics: string[];
    preview: {
        interests: string[];
        bio: string;
    };
};

export type FilterOptions = {
    minAge: number;
    maxAge: number;
    minFame: number;
    maxFame: number;
    maxDistance: number;
    minCommonTags: number;
    sortBy: 'age' | 'fame' | 'common_tags' | 'distance';
    filterTags: string[];
};