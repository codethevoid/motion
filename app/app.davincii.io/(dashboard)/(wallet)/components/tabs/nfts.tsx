"use client";

import { useWallet } from "@/hooks/use-wallet";
import { EmptyState } from "./empty";
import { NftCard } from "./nft-card";
import { ImageIcon } from "lucide-react";

// create a mock nft
// const nfts = [
//   {
//     id: "some-id-1",
//     taxon: 1,
//     uri: "https://ipfs.io/ipfs/bafybeihg3gqmtsoq76xz5cvdqeqfrbmxwup6r6tfsjvylpjifwexb4uwle/metadata.json",
//     isDirectImage: false,
//     issuer: "some-issuer",
//     flags: 1,
//   },
//   {
//     id: "some-id-2",
//     taxon: 1,
//     uri: "https://ipfs.io/ipfs/bafybeifaw6dcim25jn7kn4fkgyhmexbd77bar7qdwasadae3krylwpscdi/metadata.json",
//     isDirectImage: false,
//     issuer: "some-issuer",
//     flags: 1,
//   },
//   {
//     id: "some-id-3",
//     taxon: 1,
//     uri: "https://ipfs.io/ipfs/bafybeihfq5t3kzptkkujubw35zsitbfw7q43vrgv6ow626uxpt4plyrcia/metadata.json",
//     isDirectImage: false,
//     issuer: "some-issuer",
//     flags: 1,
//   },
//   {
//     id: "some-id-5",
//     taxon: 1,
//     uri: "https://ipfs.io/ipfs/bafybeied3g225t762q2cspjbal5eantejsnxaedufeaw4gm4yb4vbo6num/metadata.json",
//     isDirectImage: false,
//     issuer: "some-issuer",
//     flags: 1,
//   },
//   {
//     id: "some-id-6",
//     taxon: 1,
//     uri: "https://ecrg3juyzqj6ireug26rcfmtu5etbawrmtj7ewli3d7vh2ydtngq.arweave.net/IKJtppjME-RElDa9ERWTp0kwgtFk0_JZaNj_U-sDm00/1203.json",
//     isDirectImage: false,
//     issuer: "some-issuer",
//     flags: 1,
//   },
// ];

export const Nfts = () => {
  const { wallet, isLoading } = useWallet();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {wallet?.nfts.length === 0 ? (
        <EmptyState
          label="No NFTs found"
          icon={
            // <svg
            //   xmlns="http://www.w3.org/2000/svg"
            //   viewBox="0 0 24 24"
            //   fill="currentColor"
            //   className="h-4 w-4"
            // >
            //   <path d="M12.0049 4.00275C18.08 4.00275 23.0049 6.68904 23.0049 10.0027V14.0027C23.0049 17.3165 18.08 20.0027 12.0049 20.0027C6.03824 20.0027 1.18114 17.4115 1.00957 14.1797L1.00488 14.0027V10.0027C1.00488 6.68904 5.92975 4.00275 12.0049 4.00275ZM12.0049 16.0027C8.28443 16.0027 4.99537 14.9953 3.00466 13.4532L3.00488 14.0027C3.00488 15.8849 6.88751 18.0027 12.0049 18.0027C17.0156 18.0027 20.8426 15.9723 20.9999 14.1207L21.0049 14.0027L21.0061 13.4524C19.0155 14.9949 15.726 16.0027 12.0049 16.0027ZM12.0049 6.00275C6.88751 6.00275 3.00488 8.12054 3.00488 10.0027C3.00488 11.8849 6.88751 14.0027 12.0049 14.0027C17.1223 14.0027 21.0049 11.8849 21.0049 10.0027C21.0049 8.12054 17.1223 6.00275 12.0049 6.00275Z"></path>
            // </svg>
            <ImageIcon size={16} />
          }
        />
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {wallet?.nfts.map((nft) => <NftCard key={nft.id} nft={nft} />)}
        </div>
      )}
    </div>
  );
};
