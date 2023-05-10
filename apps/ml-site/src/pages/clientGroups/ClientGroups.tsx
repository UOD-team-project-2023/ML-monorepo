import { Button, Modal, SimpleGrid, TextInput, Title, useMantineTheme } from "@mantine/core";
import CustomAppShell from "../../components/appShell/CustomAppShell";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { Loading } from "../../components/loading/Loading";

function ClientGroups() {
  const [createGroupModalOpened, setCreateGroupModalOpened] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [refetchClients, setRefetchClients] = useState(false);
  const [refetchGroups, setRefetchGroups] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const theme = useMantineTheme();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/groups`);

      if (response.status !== 200) {
        window.location.href = "/register?error=unauthorized";
      }

      const data = await response.json();
      setGroups(data.groups);
    }
    fetchData();
    setRefetchGroups(false);
  }, [refetchGroups]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clients`);

      if (response.status !== 200) {
        window.location.href = "/register?error=unauthorized";
      }

      const data = await response.json();
      setClients(data.clients);
    }
    fetchData();
    setRefetchClients(false);
  }, [refetchClients]);

  const createGroup = async (groupName: string, groupDescription: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/groups/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        group_name: groupName,
        group_description: groupDescription,
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

    setRefetchClients(true);
    setRefetchGroups(true);
    setCreateGroupModalOpened(!createGroupModalOpened);

    return data;
  };

  if (!groups || !clients) return <Loading />;

  const saveGroups = async (deepClone: any) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/groups/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groups: deepClone,
      }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      notifications.show({
        title: "Error",
        message: typeof data.detail === "string" ? data.detail : "Something went wrong",
        color: "red",
      });
      return;
    }

    notifications.show({
      title: "Success!",
      message: "Groups saved",
      color: "green",
    });
  };

  const handleDragEnd = async ({ destination, source }: any) => {
    if (!destination) return;

    const deepClone = JSON.parse(JSON.stringify(groups));

    deepClone[destination.droppableId].clients.splice(
      destination.index,
      0,
      deepClone[source.droppableId].clients.splice(source.index, 1)[0]
    );

    await saveGroups(deepClone);

    setGroups(deepClone);
  };

  return (
    <>
      <Modal
        title={"Create a group"}
        opened={createGroupModalOpened}
        onClose={() => {
          setCreateGroupModalOpened(!createGroupModalOpened);
        }}
      >
        <TextInput
          label={"Group name"}
          placeholder={"Example: Room 236"}
          onChange={(element) => setGroupName(element.target.value)}
        />
        <TextInput
          label={"Group description"}
          placeholder={"All of the clients in room 236"}
          onChange={(element) => setGroupDescription(element.target.value)}
        />
        <Button onClick={() => createGroup(groupName, groupDescription)} mt={10}>
          Create group
        </Button>
      </Modal>
      <CustomAppShell selected={4}>
        <Button onClick={() => setCreateGroupModalOpened(!createGroupModalOpened)}>
          Create a group
        </Button>
        <SimpleGrid mt={20} mb={20} cols={2} breakpoints={[{ maxWidth: "sm", cols: 1 }]}>
          <DragDropContext onDragEnd={handleDragEnd}>
            {groups.map((group, ind) => {
              return (
                <Droppable key={ind} droppableId={ind.toString()}>
                  {(provided) => (
                    <div
                      className="group"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        padding: theme.spacing.md,
                        margin: theme.spacing.md,
                        borderRadius: theme.radius.sm,
                        backgroundColor: theme.colors.dark[9],
                        width: "100%",
                      }}
                    >
                      {group.name}
                      {group?.clients?.map((client: any, index: number) => (
                        <Draggable key={client.id} draggableId={client.id.toString()} index={index}>
                          {(provided) => (
                            <div
                              style={{
                                padding: theme.spacing.md,
                                margin: theme.spacing.md,
                                borderRadius: theme.radius.sm,
                                backgroundColor: theme.colors.dark[9],
                              }}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div
                                className="client"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: theme.spacing.sm,
                                  marginTop: theme.spacing.sm,
                                  borderRadius: theme.radius.sm,
                                  backgroundColor: theme.colors.dark[6],
                                }}
                              >
                                <Title>client: {client.host_name}</Title>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </DragDropContext>
        </SimpleGrid>
      </CustomAppShell>
    </>
  );
}
export default ClientGroups;
