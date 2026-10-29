package group.backend.websockets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationDispatcher extends TextWebSocketHandler {

    private final Map<WebSocketSession, String> sessionUsers = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public NotificationDispatcher() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String username = (String) session.getAttributes().get("username");
        if (username != null) {
            sessionUsers.put(session, username);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionUsers.remove(session);
    }

    public void broadcastToUser(String username, String type, Object payload) {
        try {
            TextMessage message = new TextMessage(
                    objectMapper.writeValueAsString(new BroadcastMessage(type, payload)));
            for (Map.Entry<WebSocketSession, String> entry : sessionUsers.entrySet()) {
                WebSocketSession session = entry.getKey();
                if (username.equals(entry.getValue()) && session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public record BroadcastMessage(String type, Object payload) {}
}