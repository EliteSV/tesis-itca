import { useQuery, useMutation } from '@tanstack/react-query';
import { invitationsApi } from '@/lib/api';
import type { AcceptInvitationDto } from '@/types/company.types';

export function useValidateInvitation(token: string) {
  return useQuery({
    queryKey: ['invitations', 'validate', token],
    queryFn: () => invitationsApi.validate(token),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: AcceptInvitationDto;
    }) => invitationsApi.accept(token, data),
  });
}

