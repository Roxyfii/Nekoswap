"use client";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Select, SelectSection, SelectItem } from "@heroui/select";
export default function AddLiquidity() {
  const animals = [
    { key: "cat", label: "Cat" },
    { key: "dog", label: "Dog" },
    { key: "elephant", label: "Elephant" },
    { key: "lion", label: "Lion" },
    { key: "tiger", label: "Tiger" },
    { key: "giraffe", label: "Giraffe" },
    { key: "dolphin", label: "Dolphin" },
    { key: "penguin", label: "Penguin" },
    { key: "zebra", label: "Zebra" },
    { key: "shark", label: "Shark" },
    { key: "whale", label: "Whale" },
    { key: "otter", label: "Otter" },
    { key: "crocodile", label: "Crocodile" },
  ];

  return (
    <div>
      <div>
        <div className="flex w-full items-center justify-around flex-wrap md:flex-nowrap gap-1">
          <Select className="max-w-xl" label="Select an animal">
            {animals.map((animal) => (
              <SelectItem key={animal.key}>{animal.label}</SelectItem>
            ))}
          </Select>
          <Select
            className="max-w-xl"
            label="Favorite Animal"
            placeholder="Select an animal"
          >
            {animals.map((animal) => (
              <SelectItem key={animal.key}>{animal.label}</SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <Accordion className="mt-20" variant="bordered">
        <AccordionItem key="1" aria-label="Accordion 1" title="Accordion 1">
          <h1>hahaha</h1>
        </AccordionItem>
        <AccordionItem key="2" aria-label="Accordion 2" title="Accordion 2">
          <h1>hahaha</h1>
        </AccordionItem>
        <AccordionItem key="3" aria-label="Accordion 3" title="Accordion 3">
          <h1>hahaha</h1>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
