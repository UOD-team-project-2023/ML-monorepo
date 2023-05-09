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
  Modal,
  Select,
} from "@mantine/core";
import { useEffect, useState } from "react";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { Loading } from "../../components/loading/Loading";
import { Pencil, Trash, User } from "tabler-icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

interface User {
  id: string;
  username: string;
  permission: string;
  me: boolean;
}

function Accounts() {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [refetch, setRefetch] = useState(false);
  const [createAccountModalOpened, setCreateAccountModalOpened] = useState(false);
  const [openEditAccountModal, setOpenEditAccountModal] = useState(false);
  const [role, setRole] = useState<string | null>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [account, setAccount] = useState<User | null>();
  const theme = useMantineTheme();

  const token = sessionStorage.getItem("token");

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
    setRefetch(false);
  }, [refetch]);

  if (!accounts) return <Loading />;

  const createAccount = async (
    accountName: string,
    accountPassword: string,
    role: string | null
  ) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/create_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: accountName,
        password: accountPassword,
        access_level: role,
      }),
    });
    const data = await response.json();
    if (response.status !== 200) {
      notifications.show({
        title: "Error",
        message: data.detail,
        color: "red",
      });
      return;
    }
    notifications.show({
      title: "Success!",
      message: data.detail,
      color: "green",
    });

    setRefetch(true);
    setCreateAccountModalOpened(!createAccountModalOpened);

    return data;
  };

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
        modals.closeAll();
      },
    });

  const editAccount = async (account: User) => {
    if (!account) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/edit_account`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: token || "",
      },
      body: JSON.stringify({
        account_id: account.id,
        username: account.username,
        permission: account.permission,
      }),
    });
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

  return (
    <>
      <Modal
        title={"Edit account"}
        opened={openEditAccountModal}
        onClose={() => setOpenEditAccountModal(!openEditAccountModal)}
      >
        <TextInput
          value={account?.username}
          label={"Username"}
          onChange={(element) => {
            if (!account) return;
            const deepAccountCopy = JSON.parse(JSON.stringify(account));
            deepAccountCopy.username = element.target.value;
            setAccount(deepAccountCopy);
          }}
        />
        <Select
          withinPortal
          data={[
            {
              label: "Admin",
              value: "ADMIN",
            },
            {
              label: "Member",
              value: "MEMBER",
            },
          ]}
          value={account?.permission}
          label={"Username"}
          onChange={(value) => {
            if (!account) return;
            if (!value) return;
            const deepAccountCopy = JSON.parse(JSON.stringify(account));
            deepAccountCopy.permission = value;
            setAccount(deepAccountCopy);
          }}
        />
        <Button
          mt={10}
          onClick={() => {
            if (!account) return;
            editAccount(account);
            setOpenEditAccountModal(!openEditAccountModal);
          }}
        >
          Edit account
        </Button>
      </Modal>
      <Modal
        title={"Create account"}
        opened={createAccountModalOpened}
        onClose={() => setCreateAccountModalOpened(!createAccountModalOpened)}
      >
        <TextInput label={"Username"} onChange={(element) => setUsername(element.target.value)} />
        <TextInput label={"Password"} onChange={(element) => setPassword(element.target.value)} />
        <Select
          label={"Role"}
          data={[
            {
              label: "Admin",
              value: "ADMIN",
            },
            {
              label: "Member",
              value: "MEMBER",
            },
          ]}
          onChange={(value) => {
            setRole(value);
          }}
        />
        <Button mt={10} onClick={() => createAccount(username, password, role)}>
          Create account
        </Button>
      </Modal>
      <CustomAppShell selected={5}>
        <Flex justify={"space-between"}>
          <Title>Accounts</Title>
          <Button onClick={() => setCreateAccountModalOpened(!createAccountModalOpened)}>
            Create new account
          </Button>
        </Flex>
        <Table verticalSpacing="sm">
          <thead>
            <tr>
              <th>Id</th>
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
                    <Flex direction={"column"}>
                      <Title size={20}>{account.username}</Title>
                      {account.me && (
                        <Text color={theme.colors.dark[2]} size={13}>
                          You
                        </Text>
                      )}
                    </Flex>
                  </Group>
                </td>
                <td>
                  <Badge color={account.permission === "ADMIN" ? "orange" : "green"}>
                    {account.permission}
                  </Badge>
                </td>
                <td>
                  <Flex align={"center"} gap={5}>
                    <Pencil
                      onClick={() => {
                        setAccount(account);
                        setOpenEditAccountModal(!openEditAccountModal);
                      }}
                      cursor={"pointer"}
                      color={theme.colors.blue[6]}
                    />
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
