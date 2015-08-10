package models;

import javax.validation.constraints.Size;

public class UserDto {

    @Size(min = 5)
    public String username;

    @Size(min = 5)
    public String password;

    public String fullname;


    public UserDto() {}

}
