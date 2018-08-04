@feab_version_0.1.0

Feature: Registration

  Background: :<>:person
    Given I have :<>:registered as a :<>:person

  Scenario: Progress from :<>:registered to :<>:verified
    Given I have :<>:registered as a :<>:person
    And I have not :<>:verified the source contact
    When I provide the expected "$KEY_VERIFICATION"
    Then I become a :<>:verified :<>:person

  Scenario: Progress from :<>:verified to :<>:disabled
    Given I am a :<>:verified :<>:person
    And I decided to :<>:disabled my :<>:person
    When I provide the confirmation "$KEY_VERIFICATION"
    Then I become a :<>:disabled :<>:person
    And I my role becomes :<>:anon

  Scenario: Verify email
    Given I am a :<>:registered :<>:person
    When I follow "Confirm my account" in the "Confirmation instructions" email
    Then I should be on the :<>:verified page

