import {
  EditIcon,
  DeleteIcon,
  CloseIcon,
  CalendarIcon,
} from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Box,
  Text,
  IconButton,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { TodoType } from "types";
import { formattedDate } from "utils";
import { FaTag, FaRegFlag } from "react-icons/fa";
import { MdOutlineEditNote } from "react-icons/md";

type PropsType = {
  todoDetail: TodoType;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todoDetail: TodoType) => void;
  onDelete: (todoDetail: TodoType) => void;
};

export default function TodoDetailModal(props: PropsType): JSX.Element {
  const { todoDetail, isOpen, onClose, onEdit, onDelete } = props;

  const convertedStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case "todo":
        return <Badge className="uppercase">{status}</Badge>;
      case "inprogress":
        return (
          <Badge colorScheme="purple" className="uppercase">
            {status}
          </Badge>
        );
      case "done":
        return (
          <Badge colorScheme="green" className="uppercase">
            {status}
          </Badge>
        );
      default:
        return <></>;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader className="flex justify-end">
            <IconButton
              variant="unstyled"
              className="!min-w-0 !min-h-0 !mr-6"
              aria-label="Search database"
              fontSize="20"
              icon={<EditIcon />}
              onClick={() => {
                onEdit(todoDetail);
              }}
            />
            <IconButton
              variant="unstyled"
              className="!min-w-0 !min-h-0 !mr-6"
              aria-label="Search database"
              fontSize="20"
              icon={<DeleteIcon />}
              onClick={() => {
                onDelete(todoDetail);
              }}
            />
            <IconButton
              variant="unstyled"
              className="!min-w-0 !min-h-0 !mr-4"
              aria-label="Search database"
              fontSize="20"
              icon={<CloseIcon />}
              onClick={onClose}
            />
          </ModalHeader>
          <ModalBody>
            <Box>
              <Text className="my-4" fontSize="xl">
                {todoDetail.title}
              </Text>
              <div className="my-4 flex items-center">
                <Icon className="mr-2" as={MdOutlineEditNote} />
                <Text>{todoDetail.description}</Text>
              </div>
              <div className="my-4 flex items-center">
                <Icon className="mr-2" as={FaRegFlag} />
                {convertedStatusBadge(todoDetail.status ?? "")}
              </div>
              <div className="flex flex-wrap items-center my-4">
                <Icon className="mr-2" as={FaTag} />
                {todoDetail.categories.map((c) => {
                  return (
                    <Badge
                      key={c.id}
                      className="px-1 m-1"
                      colorScheme={c.color}
                    >
                      {c.name}
                    </Badge>
                  );
                })}
              </div>
              <div className="flex items-center my-4">
                <CalendarIcon className="mr-2" />
                <Text>
                  {formattedDate(new Date(todoDetail.completionDate ?? ""))}
                </Text>
              </div>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
