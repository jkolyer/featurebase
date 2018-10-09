// @flow
import React, { Component } from "react";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";

type Props = {};
type State = { isOpen: boolean, users: Array<string> };

class App extends Component<Props, State> {
    
    constructor(props: Props) {
	super(props);

	(this: any).toggle = this.toggle.bind(this);
	(this: any).state = {
	    isOpen: false,
            users: []
	};
    }
    componentDidMount() {
	fetch('/users')
	    .then(res => res.json())
	    .then(users =>
                  this.setState({
                          ...this.state,
                      users: users }));
    }
    toggle() {
	this.setState({
	    isOpen: !this.state.isOpen
	});
    }
    render() {
	return (
	    <div>
	      <Navbar color="light" light expand="md">
		<NavbarBrand href="/">React App</NavbarBrand>
		<NavbarToggler onClick={this.toggle} />
		<Collapse isOpen={this.state.isOpen} navbar>
		  <Nav className="ml-auto" navbar>
		    <NavItem>
		      <NavLink href="/components/">Components</NavLink>
		    </NavItem>
		    <NavItem>
		      <NavLink href="https://github.com/reactstrap/reactstrap">
		        GitHub
	              </NavLink>
		    </NavItem>
		    <UncontrolledDropdown nav inNavbar>
		      <DropdownToggle nav caret>
		        Options
	              </DropdownToggle>
		      <DropdownMenu right>
		        <DropdownItem>Option 1</DropdownItem>
		        <DropdownItem>Option 2</DropdownItem>
		        <DropdownItem divider />
		        <DropdownItem>Reset</DropdownItem>
		      </DropdownMenu>
		    </UncontrolledDropdown>
		  </Nav>
		</Collapse>
	      </Navbar>
	    </div>
	);
    }
}

export default App;
