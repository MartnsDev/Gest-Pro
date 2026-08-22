package br.com.gestpro.infra.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        // Esta etapa apenas obtém a identidade. A conta só pode ser criada ou
        // vinculada depois que o success handler validar email_verified.
        return super.loadUser(userRequest);
    }
}
