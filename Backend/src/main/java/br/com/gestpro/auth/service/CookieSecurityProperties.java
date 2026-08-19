package br.com.gestpro.auth.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.cookie")
public class CookieSecurityProperties {

    private boolean secure = false;
    private String sameSite = "Lax";
    private long maxAgeSeconds = 604800;

    public boolean isSecure() {
        return secure;
    }

    public void setSecure(boolean secure) {
        this.secure = secure;
    }

    public String getSameSite() {
        return sameSite;
    }

    public void setSameSite(String sameSite) {
        this.sameSite = sameSite;
    }

    public long getMaxAgeSeconds() {
        return maxAgeSeconds;
    }

    public void setMaxAgeSeconds(
            long maxAgeSeconds
    ) {
        this.maxAgeSeconds = maxAgeSeconds;
    }
}