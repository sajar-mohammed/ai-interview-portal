import api from "@/lib/axios";

export const interviewService = {
    async create(jdText: string) {
        return api.post("/api/v1/interviews/", { jd_text: jdText });
    },
    async get(id: string) {
        return api.get(`/api/v1/interviews/${id}`);
    }
};

export const sessionService = {
    async start(data: { interview_id: string; candidate_name: string }) {
        return api.post("/api/v1/sessions/", data);
    },
    async validateToken(token: string) {
        return api.get(`/api/v1/sessions/validate-token?token=${token}`);
    },
    async getMessages(id: string) {
        return api.get(`/api/v1/sessions/${id}/messages`);
    },
    async getDetails(id: string) {
        return api.get(`/api/v1/sessions/${id}`);
    },
    async sendMessage(data: { session_id: string; role: string; content: string }) {
        return api.post("/api/v1/sessions/chat", data);
    },
    async triggerEvaluation(id: string) {
        return api.post(`/api/v1/sessions/${id}/evaluate`);
    }
};

export const authService = {
    async register(data: any) {
        return api.post("/api/v1/auth/register", data);
    },
    async login(data: any) {
        return api.post("/api/v1/auth/login", data);
    }
};
