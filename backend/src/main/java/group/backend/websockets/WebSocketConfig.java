package group.backend.websockets;

import group.backend.security.JwtTokenUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final NotificationDispatcher dispatcher;
    private final JwtTokenUtil jwtTokenUtil;

    public WebSocketConfig(NotificationDispatcher dispatcher, JwtTokenUtil jwtTokenUtil) {
        this.dispatcher = dispatcher;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(dispatcher, "/ws/todos")
                .addInterceptors(new JwtHandshakeInterceptor(jwtTokenUtil))
                .setAllowedOrigins("*");
    }
}