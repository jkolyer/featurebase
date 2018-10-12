// @flow
import React, { Component } from 'react';
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
    DropdownItem,
} from 'reactstrap';

type Props = {};
type State = { isOpen: boolean, users: Array<string>, roles: Array<string> };

class App extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        (this: any).toggle = this.toggle.bind(this);
        (this: any).state = {
            isOpen: false,
            users: [],
            roles: [],
        };
    }

    componentDidMount() {
        fetch('/roles')
            .then(res => res.json())
            .then((roles) => {
                this.setState(prevState => ({
                    ...prevState,
                    roles: roles,
                }));
            });
        fetch('/users')
            .then(res => res.json())
            .then((users) => {
                this.setState(prevState => ({
                    ...prevState,
                    users: users,
                }));
            });
    }

    toggle() {
        const { isOpen } = this.state;
        this.setState(prevState => ({
            ...prevState,
            isOpen: !isOpen,
        }));
    }

    render() {
        const { isOpen } = this.state;
        const { users } = this.state;
        return (
            <div>
                <Navbar color="light" light expand="md">
                    <NavbarBrand href="/">React App</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={isOpen} navbar>
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
                                    Users
                                </DropdownToggle>
                                <DropdownMenu right>
                                    {users.map(user => (
                                        <DropdownItem key={user.id}>
                                            { user.username }
                                        </DropdownItem>
                                    ))}
                                    <DropdownItem divider />
                                    <DropdownItem>{ process.env.REACT_APP_PREFIX }</DropdownItem>
                                    <DropdownItem>{ process.env.REACT_APP_ENV }</DropdownItem>
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
