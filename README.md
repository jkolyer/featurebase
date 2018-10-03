# FeatureBase

## Managing the feature lifecycle

#### [PROTOTYPE]

FeatureBase is a Rails app designed to manage the entire feature lifecycle, from conception through maintainence, versioning and deprecation.  

The app works as an in-house system supporting all stages of feature development, used by product managers, developers, QA, and devops. Feature lifecycle stages are defined as 
<ol><li>concept</li>
  <li>develop</li>
  <li>staged</li>
  <li>production</li>
  <li>deprecate</li>
</ol>

The system is accessed through an administraion portal and a JSON API; it integrates with external systems such as JIRA, github, and analytics tools.  The portal is used by product managers primarily, and the API by technical team members.  

<table>
  <tr>
    <td>
      User Role
  </td>
    <td>
      Concept
  </td>
    <td>
      Develop
  </td>
    <td>
      Staged
  </td>
    <td>
      Production
  </td>
    <td>
      Deprecate
  </td>
  </tr>
    <tr>
        <td>Product Manager</td>
      <td> <!-- concept -->
        <ul>
        <li>Feature definition</li>
        <li>Admin interface</li>
        </ul>
      </td>
      <td> <!-- develop -->
        <ul>
        </ul>
      </td>
      <td> <!-- staged -->
        <ul>
        <li>Gradual roll-out</li>
        <li>A/B testing</li>
        </ul>
      </td>
      <td> <!-- production -->
        <ul>
        <li>Analytics</li>
        <li>A/B testing</li>
        <li>User support</li>
        </ul>
      </td>
      <td> <!-- deprecated -->
        <ul>
        <li>Replacement planning</li>
        </ul>
      </td>
    </tr>
    <tr>
        <td>Developer</td> <!-- user role -->
      <td> <!-- concept -->
        <ul>
        <li>JSON representation of feature data</li>
        <li>Automated test templates</li>
        <li>Component mappings</li>
        <li>Dependencies</li>
        </ul>
      </td>
      <td><!-- develop -->
        <ul>
        <li>Build-time integration</li>
        <li>Feature toggles</li>
        </ul>
      </td> 
      <td> <!-- staged -->
        <ul>
        </ul>
      </td>
      <td> <!-- production -->
        <ul>
        </ul>
      </td>
      <td> <!-- deprecated -->
        <ul>
        <li>Code removal</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>QA</td> <!-- user role -->
      <td> <!-- concept -->
        <ul>
        <li>Test plans</li>
        </ul>
      </td>
      <td><!-- develop -->
        <ul>
          <li>Verification</li>
        </ul>
      </td> 
      <td> <!-- staged -->
        <ul>
        <li>Integration testing</li>
        </ul>
      </td>
      <td> <!-- production -->
        <ul>
          <li>Bug tracking</li>
        </ul>
      </td>
      <td> <!-- deprecated -->
        <ul>
        </ul>
      </td>
  </tr>
    <tr>
      <td>Dev Ops</td> <!-- user role -->
      <td> <!-- concept -->
        <ul>
        <li>Deployment strategy</li>
        </ul>
      </td>
      <td><!-- develop -->
        <ul>
        </ul>
      </td> 
      <td> <!-- staged -->
        <ul>
        </ul>
      </td>
      <td> <!-- production -->
        <ul>
        <li>Measurement</li>
        </ul>
      </td>
      <td> <!-- deprecated -->
        <ul>
        </ul>
      </td>
  </tr>
</table>

