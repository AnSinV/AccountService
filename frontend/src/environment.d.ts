declare global {
	namespace NodeJS {
		interface ProccessEnv {
			DOMAIN_NAME: string;
			PORT: number;
		};
	};
};

export {};
