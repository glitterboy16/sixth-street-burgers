import MenuPage from "@/components/MenuPage";
import { pageMetadata } from "@/i18n/meta";
import { isLang, type Lang } from "@/i18n/config";

type Props = { params: Promise<{ lang: string }> };
const read = async (params: Props["params"]): Promise<Lang> => {
  const { lang } = await params;
  return isLang(lang) ? lang : "es";
};

export async function generateMetadata({ params }: Props) {
  return pageMetadata(await read(params), "/carta/");
}

export default async function Page({ params }: Props) {
  return <MenuPage lang={await read(params)} />;
}
