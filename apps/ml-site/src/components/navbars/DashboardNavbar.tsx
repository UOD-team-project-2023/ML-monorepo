import { Group, Navbar, useMantineTheme, Flex, Code, Title, Image } from "@mantine/core";
import { useEffect, useState } from "react";
import { Dashboard, Icon } from "tabler-icons-react";
import { UserProfileButton } from "../profile/UserProfileButton";
import { useStyles } from "./dashboardNavbar.styles";
import monitorLizardLogo from "../../../public/monitor_lizard.png";
import { Loading } from "../loading/Loading";

export interface NavBarLinks {
  link: string;
  label: string;
  icon: Icon | null;
}

const data: NavBarLinks[] = [
  { link: "", label: "Public", icon: null },
  { link: "/dashboard", label: "Dashboard", icon: Dashboard },
  { link: "/stats", label: "Overview", icon: Dashboard },
  { link: "/alerts", label: "Alerts", icon: Dashboard },
  { link: "", label: "Admin", icon: null },
  { link: "/groups", label: "Groups", icon: Dashboard },
  { link: "/settings", label: "Settings", icon: Dashboard },
  { link: "/sysconfig", label: "Sys config", icon: Dashboard },
];

interface Props {
  opened: boolean;
  selected: number;
}

export function DashboardNavbar({ opened, selected }: Props) {
  const { classes, cx } = useStyles();
  const [active, setActive] = useState(selected);
  const [user, setUser] = useState<any>();
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${apiURL}/user_profile?token=${token}`);

      const data = await response.json();
      if (response.status !== 200) {
        window.location.href = "/register";
      }
      setFetched(true);
      setUser(data.user);
    }
    fetchUsers();
  }, []);

  if (!fetched) {
    return <Loading />;
  }

  const links = data.map((item, index) => {
    return (
      <>
        {item.link && item.icon ? (
          <a
            className={cx(classes.link, { [classes.linkActive]: index === active })}
            href={item.link}
            key={item.label}
            onClick={() => setActive(index)}
          >
            <item.icon color={"white"} />
            <span>{item.label}</span>
          </a>
        ) : (
          <Title size={20}>{item.label}</Title>
        )}
      </>
    );
  });

  return (
    <>
      <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 250, md: 250, lg: 250 }}>
        <Navbar.Section grow>
          <Group spacing={10}>
            <Image radius={50} src={monitorLizardLogo} width={32} height={32} />
            <h2>Monitor Lizard</h2>
          </Group>
          <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <Flex gap={"xl"}>
              <Code>v1.0.0</Code>
            </Flex>
          </div>
          {links}
        </Navbar.Section>
        <Navbar.Section>
          <UserProfileButton name={user.username} image={null} />
        </Navbar.Section>
      </Navbar>
    </>
  );
}
