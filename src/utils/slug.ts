export const generateSlug = (text: string): string => {
  if (!text) return "";

  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const generateUniqueSlug = async (
  baseText: string,
  isSlugTaken: (slug: string) => Promise<boolean>
): Promise<string> => {
  const baseSlug = generateSlug(baseText) || "post";
  let candidateSlug = baseSlug;
  let isTaken = await isSlugTaken(candidateSlug);

  while (isTaken) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    candidateSlug = `${baseSlug}-${randomNum}`;
    isTaken = await isSlugTaken(candidateSlug);
  }

  return candidateSlug;
};

export default generateSlug;
