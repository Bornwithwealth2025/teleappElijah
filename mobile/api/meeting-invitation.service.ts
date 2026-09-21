import apiClient from "@/api/client";

export type InviteMeetingMemberPayload = {
  email: string;
  member_role: "attendee" | "speaker";
};

const MeetingInvitationService = {
  async inviteMember(
    meetingId: string | number,
    payload: InviteMeetingMemberPayload,
  ) {
    const { data } = await apiClient.post(
      `/user/meetings/${meetingId}/members`,
      payload,
    );

    return data;
  },

  async respondToInvitation(
    memberId: string | number,
    status: "accepted" | "declined",
  ) {
    const { data } = await apiClient.patch(
      `/user/meeting-invitations/${memberId}`,
      { status },
    );

    return data;
  },

  async getMeetingInbox() {
    const { data } = await apiClient.get("/user/meetings/inbox");

    return data;
  },
};

export default MeetingInvitationService;