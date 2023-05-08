import {
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Table,
  Title,
  useMantineTheme,
  Text,
  Code,
  TextInput,
  PasswordInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { Loading } from "../../components/loading/Loading";
import { Pencil, Trash, User } from "tabler-icons-react";
import { modals } from "@mantine/modals";
import { notifications, showNotification } from "@mantine/notifications";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permission: string;
}

function Accounts() {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [refetch, setRefetch] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const theme = useMantineTheme();

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    setTimeout(() => {
      setRefetch(!refetch);
    }, 30000);
  }, [refetch]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users?token=${token}`);

      if (response.status !== 200) {
        window.location.href = "/register?error=unauthorized";
      }

      const data = await response.json();
      setAccounts(data.users);
    }
    fetchData();
  }, [refetch]);

  if (!accounts) return <Loading />;

  const deleteAccount = async (accountId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/delete_account?account_id=${accountId}&token=${token}`,
      {
        method: "DELETE",
      }
    );
    const data = await response.json();

    if (response.status !== 200) {
      return notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
    }

    notifications.show({
      title: "Success",
      message: data.detail,
      color: "green",
    });
    setRefetch(true);
  };

  const openDeleteAccountModal = (account: User) =>
    modals.openConfirmModal({
      title: "Delete account",
      centered: false,
      children: (
        <Text>
          Are you sure you wish to delete the account: <Code>{account.username}</Code>? This cannot
          be undone
        </Text>
      ),
      labels: { confirm: "Delete account", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteAccount(account.id);
      },
    });

  const createAccount = async (accountName: string, accountPassword: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/create_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: accountName,
        password: accountPassword,
        access_level: "ADMIN",
      }),
    });
    const data = await response.json();
    notifications.show({
      title: "Error",
      message: data.detail,
      color: "red",
    });
    return data;
  };

  return (
    <>
      <CustomAppShell selected={5}>
        <Flex justify={"space-between"}>
          <Title>Accounts</Title>
          <Button
            onClick={() => {
              modals.open({
                title: "Create new account",
                children: (
                  <>
                    <TextInput
                      onChange={(element) => setUsername(element.target.value)}
                      label="Account username"
                      placeholder="account username"
                    />
                    {username}
                    {password}
                    <PasswordInput
                      onChange={(element) => setPassword(element.target.value)}
                      label={"Account password"}
                      placeholder="account password"
                    />
                    <Button
                      onClick={async () => {
                        await createAccount(username, password);
                        modals.closeAll();
                      }}
                      mt="md"
                    >
                      Submit
                    </Button>
                  </>
                ),
              });
            }}
          >
            Create new account
          </Button>
        </Flex>
        <Table verticalSpacing="sm">
          <thead>
            <tr>
              <th>Id</th>
              <th>Email</th>
              <th>Role</th>
              <th>Settings</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <Group>
                    <Avatar color={"blue"} radius="xl" />
                    <Title size={20}>{account.username}</Title>
                  </Group>
                </td>
                <td>{account.email}</td>
                <td>
                  <Badge>{account.permission}</Badge>
                </td>
                <td>
                  <Flex align={"center"} gap={5}>
                    <Pencil cursor={"pointer"} color={theme.colors.blue[6]} />
                    <Trash
                      onClick={() => openDeleteAccountModal(account)}
                      cursor={"pointer"}
                      color="red"
                    />
                  </Flex>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CustomAppShell>
    </>
  );
}
export default Accounts;
