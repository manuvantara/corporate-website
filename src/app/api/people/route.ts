import { getPeopleFullPageOrPartialPage } from '@/lib/notion';
import { isFullPage } from '@notionhq/client';
import { NextResponse } from 'next/server';
import type { Person } from '@/types';

export const runtime = 'edge';

export async function GET() {
  const rawData = await getPeopleFullPageOrPartialPage();

  const people: Person[] = [];

  for (const page of rawData.results) {
    if (!isFullPage(page)) {
      continue;
    }

    // TODO: Find a better way to do this
    const person = {
      id: page.id,
      name:
        page.properties.Name.type === 'title'
          ? page.properties.Name.title[0].plain_text
          : '',
      title:
        page.properties.Title.type === 'rich_text'
          ? page.properties.Title.rich_text[0].plain_text
          : '',
      image:
        page.properties.Image.type === 'files'
          ? page.properties.Image.files[0].type === 'external'
            ? page.properties.Image.files[0].external.url
            : ''
          : '',
      location:
        page.properties.Location.type === 'rich_text'
          ? page.properties.Location.rich_text[0].plain_text
          : '',
    };

    people.push(person);
  }

  if (people.length === 0) {
    return NextResponse.json('No people found.', {
      headers: {
        'content-type': 'application/json',
      },
      status: 404,
    });
  }

  return NextResponse.json(people, {
    headers: {
      'content-type': 'application/json',
    },
    status: 200,
  });
}
