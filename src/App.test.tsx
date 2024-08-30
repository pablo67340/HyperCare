import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import App from './App';

// Define a mock for the fetch response
const mockFetchResponse = (data: object, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  } as Response);
};

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation(() =>
    mockFetchResponse({
      data: {
        users: [
          {
            id: '1',
            username: 'jdoe',
            firstname: 'John',
            lastname: 'Doe',
            email: 'jdoe@example.com',
            avatar: 'https://robohash.org/jdoe.png',
            role: 'Engineer',
            join_date: '01/01/2023',
            description: 'A skilled engineer.',
          },
        ],
      },
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders user cards after successful data fetch', async () => {
  render(<App />);

  // Wait for the user card to be rendered
  await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());

  // Check that the user's role is also rendered
  expect(screen.getByText(/Engineer/i)).toBeInTheDocument();
});

test('renders error message on API failure', async () => {
  // Mock the fetch function to reject with an error
  jest.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.reject('API is down'),
    }) as Promise<Response>
  );

  // Mock console.error to suppress the error log
  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

  render(<App />);

  // Wait for the error message to be rendered
  await waitFor(() => expect(screen.getByText(/Failed to fetch users/i)).toBeInTheDocument());

  // Restore console.error after the test
  consoleErrorMock.mockRestore();
});

test('opens and closes the modal with user details', async () => {
  render(<App />);

  // Wait for the user card to be rendered
  await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());

  // Simulate clicking the "View More" button
  fireEvent.click(screen.getByText(/View More/i));

  // Target the modal window specifically
  const modal = screen.getByRole('dialog');

  // Use within to scope the search to the modal window
  expect(within(modal).getByText(/John Doe/i)).toBeInTheDocument();
  expect(within(modal).getByText(/A skilled engineer./i)).toBeInTheDocument();

  // Simulate closing the modal window by clicking the close button
  fireEvent.click(screen.getByLabelText('close'));

  // Ensure the modal is no longer visible
  await waitFor(() => expect(modal).not.toBeInTheDocument());
});
