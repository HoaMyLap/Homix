package com.example.smartmanager.auth;

import com.example.smartmanager.users.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    private String id;
    private String email;
    private String password;
    private String fullname;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String email, String password, String fullname) {
        this(id, email, password, fullname, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    public static UserPrincipal create(UserEntity user) {
        String role = user.getSystemRole() != null ? user.getSystemRole().toUpperCase() : "USER";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        return new UserPrincipal(
                user.getId().toString(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullname(),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities != null ? authorities : Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
