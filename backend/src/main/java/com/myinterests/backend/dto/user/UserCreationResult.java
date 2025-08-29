package com.myinterests.backend.dto.user;

import com.myinterests.backend.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserCreationResult {
    public enum Status {
        SUCCESS,
        USER_ALREADY_EXISTS,
        INVALID_DATA
    }
    
    private final Status status;
    private final User user;
    private final String message;
    
    public static UserCreationResult success(User user) {
        return new UserCreationResult(Status.SUCCESS, user, "User created successfully");
    }
    
    public static UserCreationResult userAlreadyExists(User existingUser) {
        return new UserCreationResult(Status.USER_ALREADY_EXISTS, existingUser, 
            "This wallet address is already registered. Please use the login page to sign in with your existing account.");
    }
    
    public static UserCreationResult invalidData(String message) {
        return new UserCreationResult(Status.INVALID_DATA, null, message);
    }
    
    public boolean isSuccess() {
        return status == Status.SUCCESS;
    }
    
    public boolean isUserAlreadyExists() {
        return status == Status.USER_ALREADY_EXISTS;
    }
}