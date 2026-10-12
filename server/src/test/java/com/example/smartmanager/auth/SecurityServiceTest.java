package com.example.smartmanager.auth;

import com.example.smartmanager.projects.ProjectEntity;
import com.example.smartmanager.projects.ProjectMemberEntity;
import com.example.smartmanager.projects.ProjectMemberId;
import com.example.smartmanager.projects.ProjectMemberRepository;
import com.example.smartmanager.projects.ProjectRepository;
import com.example.smartmanager.tasks.TaskRepository;
import com.example.smartmanager.workspaces.WorkspaceMemberEntity;
import com.example.smartmanager.workspaces.WorkspaceMemberId;
import com.example.smartmanager.workspaces.WorkspaceMemberPermissionEntity;
import com.example.smartmanager.workspaces.WorkspaceMemberPermissionId;
import com.example.smartmanager.workspaces.WorkspaceMemberPermissionRepository;
import com.example.smartmanager.workspaces.WorkspaceMemberRepository;
import com.example.smartmanager.workspaces.WorkspaceRolePermissionEntity;
import com.example.smartmanager.workspaces.WorkspaceRolePermissionId;
import com.example.smartmanager.workspaces.WorkspaceRolePermissionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityServiceTest {

    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private WorkspaceRolePermissionRepository rolePermissionRepository;

    @Mock
    private WorkspaceMemberPermissionRepository memberPermissionRepository;

    @InjectMocks
    private SecurityService securityService;

    private UUID workspaceId;
    private UUID projectId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        projectId = UUID.randomUUID();
        userId = UUID.randomUUID();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("1. Phân quyền cá nhân (Member Override) cho phép hoặc từ chối ưu tiên cao nhất")
    void testDirectMemberPermissionOverride() {
        WorkspaceMemberPermissionId allowId = new WorkspaceMemberPermissionId(workspaceId, userId, "PROJECT_DELETE");
        when(memberPermissionRepository.findById(allowId))
                .thenReturn(Optional.of(new WorkspaceMemberPermissionEntity(allowId, true)));

        assertTrue(securityService.hasPermission(workspaceId, userId, "PROJECT_DELETE"));

        WorkspaceMemberPermissionId denyId = new WorkspaceMemberPermissionId(workspaceId, userId, "TASK_CREATE");
        when(memberPermissionRepository.findById(denyId))
                .thenReturn(Optional.of(new WorkspaceMemberPermissionEntity(denyId, false)));

        assertFalse(securityService.hasPermission(workspaceId, userId, "TASK_CREATE"));
    }

    @Test
    @DisplayName("2. Workspace ADMIN mặc định có toàn quyền trên mọi mã quyền hạn")
    void testAdminDefaultBypass() {
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId, userId);
        WorkspaceMemberEntity adminMember = new WorkspaceMemberEntity(memberId, "ADMIN", LocalDateTime.now());
        when(workspaceMemberRepository.findById(memberId)).thenReturn(Optional.of(adminMember));

        assertTrue(securityService.hasPermission(workspaceId, userId, "WORKSPACE_DELETE"));
        assertTrue(securityService.hasPermission(workspaceId, userId, "WORKSPACE_ROLE_MANAGE"));
        assertTrue(securityService.hasPermission(workspaceId, userId, "PROJECT_DELETE"));
    }

    @Test
    @DisplayName("3. Vai trò tùy chỉnh (Custom Role) chỉ cấp đúng các quyền được gán")
    void testCustomRolePermissionEvaluation() {
        UUID customRoleId = UUID.randomUUID();
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId, userId);
        WorkspaceMemberEntity customMember = new WorkspaceMemberEntity(memberId, "MEMBER", customRoleId, LocalDateTime.now());
        when(workspaceMemberRepository.findById(memberId)).thenReturn(Optional.of(customMember));

        WorkspaceRolePermissionId grantedPerm = new WorkspaceRolePermissionId(customRoleId, "TASK_CREATE");
        when(rolePermissionRepository.findById(grantedPerm))
                .thenReturn(Optional.of(new WorkspaceRolePermissionEntity(grantedPerm)));

        WorkspaceRolePermissionId missingPerm = new WorkspaceRolePermissionId(customRoleId, "PROJECT_DELETE");
        when(rolePermissionRepository.findById(missingPerm)).thenReturn(Optional.empty());

        assertTrue(securityService.hasPermission(workspaceId, userId, "TASK_CREATE"));
        assertFalse(securityService.hasPermission(workspaceId, userId, "PROJECT_DELETE"));
    }

    @Test
    @DisplayName("4. Vai trò mặc định MEMBER và VIEWER tuân thủ ma trận 16 quyền hạn")
    void testDefaultMemberAndViewerPermissions() {
        WorkspaceMemberId memberId = new WorkspaceMemberId(workspaceId, userId);
        WorkspaceMemberEntity defaultMember = new WorkspaceMemberEntity(memberId, "MEMBER", LocalDateTime.now());
        when(workspaceMemberRepository.findById(memberId)).thenReturn(Optional.of(defaultMember));

        assertTrue(securityService.hasPermission(workspaceId, userId, "TASK_CREATE"));
        assertTrue(securityService.hasPermission(workspaceId, userId, "PROJECT_CREATE"));
        assertFalse(securityService.hasPermission(workspaceId, userId, "WORKSPACE_DELETE"));
        assertFalse(securityService.hasPermission(workspaceId, userId, "WORKSPACE_ROLE_MANAGE"));

        WorkspaceMemberEntity viewerMember = new WorkspaceMemberEntity(memberId, "VIEWER", LocalDateTime.now());
        when(workspaceMemberRepository.findById(memberId)).thenReturn(Optional.of(viewerMember));

        assertTrue(securityService.hasPermission(workspaceId, userId, "WORKSPACE_VIEW"));
        assertTrue(securityService.hasPermission(workspaceId, userId, "PROJECT_VIEW"));
        assertTrue(securityService.hasPermission(workspaceId, userId, "TASK_VIEW"));
        assertFalse(securityService.hasPermission(workspaceId, userId, "TASK_CREATE"));
        assertFalse(securityService.hasPermission(workspaceId, userId, "TASK_UPDATE"));
    }

    @Test
    @DisplayName("5. Kiểm tra phân quyền cấp Dự án (hasProjectRole) kết hợp SecurityContext")
    void testHasProjectRoleEvaluation() {
        UserPrincipal principal = new UserPrincipal(userId.toString(), "user@homix.vn", "hashed", "MEMBER");
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        ProjectEntity project = new ProjectEntity();
        project.setId(projectId);
        project.setWorkspaceId(workspaceId);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        WorkspaceMemberId wsMemberId = new WorkspaceMemberId(workspaceId, userId);
        when(workspaceMemberRepository.findById(wsMemberId))
                .thenReturn(Optional.of(new WorkspaceMemberEntity(wsMemberId, "MEMBER", LocalDateTime.now())));

        ProjectMemberId pmId = new ProjectMemberId(projectId, userId);
        ProjectMemberEntity pm = new ProjectMemberEntity();
        pm.setId(pmId);
        pm.setRole("MEMBER");
        when(projectMemberRepository.findById(pmId)).thenReturn(Optional.of(pm));

        assertTrue(securityService.hasProjectRole(projectId.toString(), "VIEWER"));
        assertTrue(securityService.hasProjectRole(projectId.toString(), "MEMBER"));
        assertFalse(securityService.hasProjectRole(projectId.toString(), "ADMIN"));
    }
}
