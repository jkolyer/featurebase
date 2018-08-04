@feab_version_0.1.0

@authenticator_prompt:<cmpt>
@authenticator_prompt_register:<cmpt>
@authenticator_prompt_signin:<cmpt>
@authenticator_prompt_signout:<cmpt>
@authenticator_prompt_forgot_pw:<cmpt>
@authenticator_redirect_register:<cmpt>
@authenticator_redirect_signin:<cmpt>
@authenticator_redirect_signout:<cmpt>
@authenticator_redirect_error:<cmpt>

Feature: Authentication
  In order to prevent people from seeing each others data
  As a software as a service provider
  I want to identify each user

  Background: anon:<role>
    Given I am not authenticated

  
  Scenario: Authentication required
    Given I am on component limited site:<domain> authenticator_prompt:<cmpt> constraint 
    When I follow "$LINK_NAME"
    Then I should see "You need to sign in or register before continuing."

  Scenario: Register as person:<role>
    Given I am on the authenticator_prompt_register:<cmpt>
    And I follow "Register"
    And I fill in "user_email" with "test@timefliesby.com"
    And I fill in "user_password" with "secret"
    And I fill in "user_password_confirmation" with "secret"
    When I press "Register"
    Then I should be on the authenticator_redirect_register:<cmpt>
    And I should see "Welcome! You have registered successfully."

  Scenario: Login
    Given I have a person:<role> account
    And I am on the authenticator_prompt_signin:<cmpt>
    And I follow "Sign in"
    And I fill in "user_email" with "test@timefliesby.com"
    And I fill in "user_password" with "secret"
    When I press "Sign in"
    Then I should be on the authenticator_redirect_signin:<cmpt>
    Then I should see "Signed in successfully."
    And I should see "Sign out"

  Scenario: Sign Out
    Given I am signed in as a new user
    Given I am signed in as a person:<role> 
    When I follow "Sign out"
    Then I should be on the authenticator_redirect_signout:<cmpt>
    And I should see "Signed out successfully."
    
