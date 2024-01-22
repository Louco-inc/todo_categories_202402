import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Header(): JSX.Element {
  const router = useRouter();

  const variantAndClassNameProps = (
    name: string
  ): {
    variant: string;
    className: string;
    color: string;
    borderColor: string;
  } => {
    const pathname = router.pathname;
    const baseClassName = "mr-4";
    if (pathname.endsWith(name)) {
      return {
        variant: "solid",
        className: baseClassName,
        color: "",
        borderColor: "",
      };
    } else {
      return {
        variant: "outline",
        className: baseClassName + " " + "buttonNonActiveColor",
        color: "buttonNonActiveColor",
        borderColor: "buttonNonActiveColor",
      };
    }
  };

  const hoverEffect = (
    name: string
  ): { color: string; borderColor: string } => {
    if (router.pathname?.endsWith(name)) {
      return { color: "", borderColor: "" };
    } else {
      return { color: "#FFFFFF", borderColor: "#FFFFFF" };
    }
  };

  return (
    <div className="px-8 py-2 bg-main-color">
      <div className="my-4 flex justify-between">
        <h2 className="text-white font-bold text-2xl mr-4">Todo + Categories</h2>
        <div>
          <Button
            _hover={hoverEffect("/daichi")}
            {...variantAndClassNameProps("daichi")}
            onClick={async () => await router.push("/daichi")}
          >
            daichi
          </Button>
          <Button
            _hover={hoverEffect("/kaichi")}
            {...variantAndClassNameProps("kaichi")}
            onClick={async () => await router.push("kaichi")}
          >
            kaichi
          </Button>
          <Button
            _hover={hoverEffect("/morishun")}
            {...variantAndClassNameProps("morishun")}
            onClick={async () => await router.push("morishun")}
          >
            morishun
          </Button>
          <Button
            _hover={hoverEffect("/naoya")}
            {...variantAndClassNameProps("naoya")}
            onClick={async () => await router.push("naoya")}
          >
            naoya
          </Button>
        </div>
      </div>
    </div>
  );
}
