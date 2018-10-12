# FeatureBase
[<b>PROTOTYPE</b>]
 
## Managing the Feature Lifecycle

FeatureBase is an application designed to manage the entire feature lifecycle, from conception through maintainence, versioning and deprecation.  The app works as an in-house system supporting all stages of feature development, used by product managers, developers, QA, and devops.  

Prototype implementations are written in React / Node / MongoDB (<i>[feab-js](https://github.com/jkolyer/featurebase/tree/develop/feab-js)</i>) and Rails / PostgreSQL (<i>[feab-r](https://github.com/jkolyer/featurebase/tree/develop/feab-r)</i>).

The system is accessed through an administration portal, a JSON API, and in-memory databases.  It integrates with external systems such as JIRA, github, and analytics tools.  The admin portal captures feature definitions, screen designs, status, and development components, and can serve as a live dashboard of feature performance.  The API can be used by developers and QA for build/test, and devops in production.  

Features are associated with a given application <i>Role</i> and functional <i>Domain</i>.  <i>Roles</i> describe the type of user acting on your system; <i>domains</i> group your features along functional lines.  They are discussed below.

Feature lifecycle stages are defined as 
<ol><li>conception</li>
  <li>development</li>
  <li>staging</li>
  <li>production</li>
  <li>deprecated</li>
</ol>

### Team Members

This table describes how product team members will interact with the FeatureBase system over the lifecycle stages.

<table>
  <tr>
    <td>
      Member Role
  </td>
    <td>
      Conception
  </td>
    <td>
      Development
  </td>
    <td>
      Staging
  </td>
    <td>
      Production
  </td>
    <td>
      Deprecated
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
          <li>Feature verification</li>
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
        <li>Runtime requirements</li>
        </ul>
      </td>
      <td><!-- develop -->
        <ul>
        </ul>
      </td> 
      <td> <!-- staged -->
        <ul>
        <li>Runtime integration</li>
        </ul>
      </td>
      <td> <!-- production -->
        <ul>
        <li>Measurement</li>
        <li>Runtime access</li>
        </ul>
      </td>
      <td> <!-- deprecated -->
        <ul>
        </ul>
      </td>
  </tr>
</table>

## Implementation Details

### System Access

The system is designed as a stand-alone app that's accessible by product managers and developers, and at runtime in a production system.  At build time developers can integrate JSON API calls to extract feature toggle, for example, which can be inserted into code.  At runtime feature data can be loaded into memory, accessible by production system through Redis, for example.

Feature data can be managed to fit into a small memory footprint.  This allows ease of use for developers, and fast, flexible availability at runtime in production.  

Internally features are formatted using the [Gherkin domain language](https://docs.cucumber.io/gherkin/reference/), which is used as an interim input technique (until a user interface for browsing and editing is developed).  This approach is also useful for testing and prototyping purposes, as we can include annotations for expressing more feature details.

### DB Schema

The primary entities allow nested hierarchical relationships:  <i>Features</i>, <i>Roles</i>, <i>Domains</i>.

#### Features

A prototypical example of a hiearchical feature is user authentication.  This is represented as a general top-level feature, with children representing more detailed granularity.  

<ul>
  <li>Authentication
  <ul>
    <li>Login</li>
    <li>Registration
      <ul>
        <li>Confirmation</li>
       </ul>
    </li>
    <li>Forgot Password</li>
  </ul>
  </li>
</ul>


#### Roles
These are the intended user roles for a given feature.  In the following example, a <i>premium user</i> inherits from the <i>user</i> role, and the <i>admin</i> inherits from the former.  
<ul>
  <li>User:  authenticated user with basic feature access
  <ul>
    <li>Premium User:  authenticated user will full feature access
    <ul>
      <li>Admin:  super user privileges</li>
     </ul>
    </li>
   </ul>
   </li>
  <li>Guest:  an unauthenticated user</li>
</ul>

#### Domains
Domains represent groupings of features based on their business function.  

##### Example
<ul>
  <li>Site:  baseline features most apps support (e.g., authentication, navigation)</li>
  <li>Adhoc:  feature set for baseline product offering</li>
  <li>Business Vertical:  features targetting a specific business vertical</li>
</ul>

