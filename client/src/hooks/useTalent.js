import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import talentApi from "../services/talentApi";

// 1. Opportunities Queries & Mutations
export const useOpportunities = (params = {}) => {
  return useQuery({
    queryKey: ["opportunities", params],
    queryFn: () => talentApi.getAllOpportunities(params),
  });
};

export const useOpportunity = (id) => {
  return useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => talentApi.getOpportunityById(id),
    enabled: !!id,
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: talentApi.createOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });
};

// 2. Applications Queries & Mutations
export const useOrgApplications = () => {
  return useQuery({
    queryKey: ["orgApplications"],
    queryFn: talentApi.getOrgApplications,
  });
};

export const useOpportunityApplications = (id) => {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => talentApi.getOpportunityApplications(id),
    enabled: !!id,
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: talentApi.getMyApplications,
  });
};

export const useApplyForOpportunity = (id) => {
  return useMutation({
    mutationFn: (applicationData) =>
      talentApi.applyForOpportunity(id, applicationData),
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusData }) =>
      talentApi.updateApplicationStatus(id, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      // Might also want to invalidate archives
      queryClient.invalidateQueries({ queryKey: ["archives"] });
    },
  });
};

// 3. Public Profile Queries & Mutations
export const usePublicProfile = (username) => {
  return useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => talentApi.getPublicProfile(username),
    enabled: !!username,
  });
};

export const useUpdatePublicProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: talentApi.updatePublicProfile,
    onSuccess: (data) => {
      // Typically invalidate user's self query or profile
      if (data?.profile?.username) {
        queryClient.invalidateQueries({
          queryKey: ["publicProfile", data.profile.username],
        });
      }
    },
  });
};

// 4. Messaging
export const useOrgConversations = () => {
  return useQuery({
    queryKey: ["orgConversations"],
    queryFn: talentApi.getOrgConversations,
    refetchInterval: 10000, // every 10s for chat updates
  });
};

export const useApplicationMessages = (applicationId) => {
  return useQuery({
    queryKey: ["messages", applicationId],
    queryFn: () => talentApi.getApplicationMessages(applicationId),
    enabled: !!applicationId,
    // Polling or websocket usually better here, but useQuery is fine for now
    refetchInterval: 5000,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, content }) =>
      talentApi.sendMessage(applicationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.applicationId],
      });
    },
  });
};

// 4b. Direct Messages (Shortlisted Talent)
export const useDirectMessages = (userId, organizationId) => {
  return useQuery({
    queryKey: ["directMessages", userId, organizationId],
    queryFn: () => talentApi.getDirectMessages(userId, { organizationId }),
    enabled: !!userId && !!organizationId,
    refetchInterval: 5000,
  });
};

export const useSendDirectMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, content, organizationId }) =>
      talentApi.sendDirectMessage(userId, { content, organizationId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "directMessages",
          variables.userId,
          variables.organizationId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: ["orgConversations"] });
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => talentApi.deleteConversation(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgConversations"] });
    },
  });
};

// 5. Archives
export const useArchives = () => {
  return useQuery({
    queryKey: ["archives"],
    queryFn: talentApi.getArchives,
  });
};

export const useDeleteArchive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: talentApi.deleteFromArchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archives"] });
    },
  });
};
