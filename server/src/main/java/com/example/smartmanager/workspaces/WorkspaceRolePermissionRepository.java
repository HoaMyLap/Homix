package com.example.smartmanager.workspaces;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkspaceRolePermissionRepository extends JpaRepository<WorkspaceRolePermissionEntity, WorkspaceRolePermissionId> {
    List<WorkspaceRolePermissionEntity> findByIdRoleId(UUID roleId);
    List<WorkspaceRolePermissionEntity> findByIdRoleIdIn(Collection<UUID> roleIds);
    void deleteByIdRoleId(UUID roleId);
}
